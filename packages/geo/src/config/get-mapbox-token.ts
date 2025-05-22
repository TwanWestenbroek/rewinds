import z from "zod/v4";

/**
 * Get the Mapbox access token from the environment variables.
 * @returns The Mapbox access token.
 */
export const getMapboxToken = () => {
  const mapboxTokenSchema = z.string();
  const result = mapboxTokenSchema.safeParse(process.env.MAPBOX_ACCESS_TOKEN);

  if (!result.success) {
    throw new Error("Invalid DATABASE_URL in environment variables");
  }

  return result.data;
};
