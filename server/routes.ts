import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema } from "@shared/schema";
import { db } from "./db";
import rateLimit from "express-rate-limit";

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

  // Incident Routes
  app.post("/api/incidents", createIncidentLimiter, async (req, res) => {
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

  app.get("/api/incidents", getIncidentsLimiter, async (req, res) => {
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

  app.delete("/api/incidents/:id", deleteIncidentLimiter, async (req, res) => {
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
