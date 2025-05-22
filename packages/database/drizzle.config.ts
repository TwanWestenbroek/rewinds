import "dotenv/config";
import { defineConfig, type Config } from "drizzle-kit";
import { getDatabaseUrl } from "./src/config/database-url";

/**
 * The Drizzle config.
 */
export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
