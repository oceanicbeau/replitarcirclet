import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIncidentSchema } from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health Check Endpoint
  app.get("/health/db", async (req, res) => {
    try {
      // Attempt to query the database
      await storage.getAllIncidents();
      res.status(200).json({ 
        status: "healthy", 
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      res.status(503).json({ 
        status: "unhealthy", 
        database: "disconnected",
        error: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Incident Routes
  app.post("/api/incidents", async (req, res) => {
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

  app.get("/api/incidents", async (req, res) => {
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

  app.delete("/api/incidents/:id", async (req, res) => {
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
