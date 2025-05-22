import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { getDatabaseUrl } from "./config/database-url";
import * as schema from "./schema";

/**
 * The database instance.
 */
const db = drizzle(getDatabaseUrl(), { schema });

export { db };
