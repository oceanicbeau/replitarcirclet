import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const incidents = pgTable("incidents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  objectType: text("object_type").notNull(),
  locationName: text("location_name").notNull(),
  gpsCoordinates: text("gps_coordinates").notNull(),
  priority: text("priority"),
  details: varchar("details", { length: 256 }),
  photoUrl: text("photo_url"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidents, {
  timestamp: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

export const detectionEvents = pgTable("detection_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  objectType: text("object_type").notNull(),
  confidence: integer("confidence").notNull(),
  source: text("source").notNull(),
  confirmed: integer("confirmed"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertDetectionEventSchema = createInsertSchema(detectionEvents).omit({
  id: true,
  timestamp: true,
});

export type InsertDetectionEvent = z.infer<typeof insertDetectionEventSchema>;
export type DetectionEvent = typeof detectionEvents.$inferSelect;

export type ObjectType = "graffiti" | "syringe" | "dog-poop";

export interface DetectedObject {
  type: ObjectType;
  name: string;
  icon: string;
  accentColor: string;
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  response: string;
}

export interface ObjectData {
  type: ObjectType;
  name: string;
  icon: string;
  accentColor: string;
  greeting: string;
  quickActions: QuickAction[];
  responses: Record<string, string>;
}
