import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const activity = pgTable("activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  message: text("message").notNull(),
  type: text("type"),
  createdAt: timestamp("created_at").defaultNow(),
});
console.log("ENV FILE PATH:", path.resolve(process.cwd(), ".env"));
console.log("Loaded ENV:", process.env.DATABASE_URL);
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
 
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
