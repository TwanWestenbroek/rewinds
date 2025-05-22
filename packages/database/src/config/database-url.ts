import z from "zod/v4";

/**
 * Get the database URL from the environment variables.
 * @returns The database URL.
 */
export const getDatabaseUrl = () => {
  const databaseUrlSchema = z.url();
  const result = databaseUrlSchema.safeParse(process.env.DATABASE_URL);

  if (!result.success) {
    throw new Error("Invalid DATABASE_URL in environment variables");
  }

  return result.data;
};
