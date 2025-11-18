import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema, insertDetectionEventSchema } from "@shared/schema";
import { db } from "./db";
import rateLimit from "express-rate-limit";
import geoip from "geoip-lite";
import NodeCache from "node-cache";
import { detectObject } from "./gemini";

// Cache for geolocation lookups (1 hour TTL)
const geoCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Utility: Extract real client IP from headers
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) return realIP as string;
  
  return req.socket.remoteAddress || '127.0.0.1';
}

// Middleware: Geolocation lookup with caching
function geolocate(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIP(req).replace(/^::ffff:/, ''); // Remove IPv6 prefix
  
  // Development fallback for localhost
  if (ip === '127.0.0.1' || ip === '::1') {
    (req as any).geoip = { 
      country: 'AU', 
      region: 'VIC', 
      city: 'Melbourne',
      dev: true 
    };
    (req as any).clientIp = ip;
    return next();
  }
  
  try {
    // Check cache first
    let geo = geoCache.get(ip);
    
    if (!geo) {
      // Perform geolocation lookup
      geo = geoip.lookup(ip) || { country: 'Unknown', region: '', city: '' };
      geoCache.set(ip, geo);
    }
    
    (req as any).geoip = geo;
    (req as any).clientIp = ip;
    
    // Log geolocation for monitoring
    console.log(`[Geo] IP: ${ip} -> ${(geo as any).country}/${(geo as any).region}/${(geo as any).city}`);
    
    next();
  } catch (error) {
    console.error('[Geo] Lookup failed:', error);
    (req as any).geoip = { country: 'Unknown', region: '', city: '' };
    (req as any).clientIp = ip;
    next();
  }
}

// Middleware: Melbourne, Australia filter
function melbourneOnly(req: Request, res: Response, next: NextFunction) {
  const geoData = (req as any).geoip;
  const clientIp = (req as any).clientIp;
  
  // Allow development/localhost
  if (geoData?.dev) {
    return next();
  }
  
  // Check if from Australia, Victoria region, and Melbourne city
  // Note: geoip-lite may return different city variations
  const isAustralia = geoData?.country === 'AU';
  const isVictoria = geoData?.region === 'VIC';
  const city = geoData?.city ?? '';
  const isMelbourne = city.toLowerCase().includes('melbourne');
  
  if (isAustralia && isVictoria && isMelbourne) {
    return next();
  }
  
  // Log warning if city data is missing for monitoring
  if (isAustralia && isVictoria && !city) {
    console.warn(`[Geo] Missing city data for Victorian IP ${clientIp}`);
  }
  
  // Log blocked access attempt
  console.warn(`[Geo] Blocked access from ${clientIp}: ${geoData?.country}/${geoData?.region}/${geoData?.city}`);
  
  res.status(451).json({ 
    error: 'Geographic restriction',
    message: 'This service is only available in Melbourne, Victoria, Australia.',
    yourLocation: {
      country: geoData?.country || 'Unknown',
      region: geoData?.region || 'Unknown',
      city: geoData?.city || 'Unknown'
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate Limiting Configuration
  
  // Strict rate limit for creating incidents (prevents bot spam)
  const createIncidentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: { error: "Too many incidents created. Please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Moderate rate limit for deletions
  const deleteIncidentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 deletions per window
    message: { error: "Too many deletion requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Lenient rate limit for reading incidents
  const getIncidentsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Very lenient rate limit for health checks
  const healthCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: { error: "Too many health check requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Moderate rate limit for object detection (AI calls are expensive)
  const detectObjectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 detections per window
    message: { error: "Too many detection requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health Check Endpoint
  app.get("/health/db", healthCheckLimiter, async (req, res) => {
    try {
      // Attempt to query the database
      await storage.getAllIncidents();
      res.status(200).json({ 
        status: "healthy", 
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log full error details to server logs for debugging
      console.error("Database health check failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error("Full health check error details:", {
        message: errorMessage,
        stack: errorStack
      });
      
      // Only expose generic error in production, detailed error in development
      res.status(503).json({ 
        status: "unhealthy", 
        database: "disconnected",
        error: process.env.NODE_ENV === "development" ? errorMessage : "Database connection failed",
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Object Detection Endpoint (using Gemini Vision AI)
  app.post("/api/detect", geolocate, melbourneOnly, detectObjectLimiter, async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ error: "Missing or invalid image data (base64 string required)" });
      }
      
      // Remove data URL prefix if present
      let base64Image = imageData;
      if (imageData.startsWith('data:')) {
        base64Image = imageData.split(',')[1];
      }
      
      // Call Gemini Vision API for object detection
      const result = await detectObject(base64Image);
      
      // Log detection event to database for analytics (only for known objects)
      if (result.objectType !== 'unknown') {
        try {
          await storage.createDetectionEvent({
            objectType: result.objectType,
            confidence: Math.round(result.confidence), // Round to integer for database
            source: 'camera',
            confirmed: null,
          });
        } catch (dbError) {
          console.warn("[Detection] Failed to log detection event:", dbError);
          // Continue even if logging fails
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error detecting object:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log detailed error for debugging
      console.error("Full detection error details:", {
        message: errorMessage,
        stack: errorStack
      });
      
      res.status(500).json({ 
        error: "Failed to detect object",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      });
    }
  });

  // Incident Routes (with geolocation + rate limiting)
  app.post("/api/incidents", geolocate, melbourneOnly, createIncidentLimiter, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log detailed error for debugging
      console.error("Full error details:", {
        message: errorMessage,
        stack: errorStack,
        data: req.body
      });
      
      res.status(400).json({ 
        error: "Failed to create incident",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      });
    }
  });

  app.get("/api/incidents", geolocate, melbourneOnly, getIncidentsLimiter, async (req, res) => {
    try {
      const incidents = await storage.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log detailed error for debugging
      console.error("Full error details:", {
        message: errorMessage,
        stack: errorStack
      });
      
      res.status(500).json({ 
        error: "Failed to fetch incidents",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      });
    }
  });

  app.delete("/api/incidents/:id", geolocate, melbourneOnly, deleteIncidentLimiter, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid incident ID" });
      }
      await storage.deleteIncident(id);
      res.status(200).json({ message: "Incident deleted successfully" });
    } catch (error) {
      console.error("Error deleting incident:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Log detailed error for debugging
      console.error("Full error details:", {
        message: errorMessage,
        stack: errorStack,
        incidentId: req.params.id
      });
      
      res.status(500).json({ 
        error: "Failed to delete incident",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
