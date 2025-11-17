import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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
