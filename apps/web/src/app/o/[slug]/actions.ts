"use server";

import { eq } from "drizzle-orm";
import { db, organisations } from "@repo/database";
import { redis } from "../../../lib/redis";

/**
 * The cached organisation data.
 */
type CachedOrganisation = {
  name: string;
};

/**
 * Create a cached organisation in Redis.
 * @param sanitizedSlug The sanitized slug to create.
 * @returns The cached organisation data or null if it doesn't exist.
 */
async function createCachedOrganisation(
  sanitizedSlug: string,
): Promise<CachedOrganisation | null> {
  const organisation = await db.query.organisations.findFirst({
    where: eq(organisations.slug, sanitizedSlug),
    columns: {
      name: true,
    },
  });

  if (!organisation) {
    return null;
  }

  await redis.set(`organisation:${sanitizedSlug}`, {
    name: organisation.name,
  });

  return {
    name: organisation.name,
  };
}

/**
 * Get a cached organisation from Redis or create it if it doesn't exist.
 * @param slug The slug to get or create.
 * @returns The cached organisation data or null if it doesn't exist.
 */
export async function getCachedOrganisation(
  slug: string,
): Promise<CachedOrganisation | null> {
  const sanitizedSlug = slug.replace(/[^a-z0-9-]/g, "");
  const data = await redis.get<CachedOrganisation>(
    `organisation:${sanitizedSlug}`,
  );

  if (!data) {
    return createCachedOrganisation(sanitizedSlug);
  }

  return data;
}

/**
 * Get all organisation slugs.
 * @returns The organisation slugs.
 */
export async function getOrganisationSlugs() {
  const data = await db.query.organisations.findMany({
    columns: {
      slug: true,
    },
  });

  return data.map((organisation) => organisation.slug);
}

/**
 * Get all events for an organisation.
 * @param slug The slug of the organisation.
 * @returns The events.
 */
export const getEvents = async ({ slug }: { slug: string }) => {
  const data = await db.query.organisations.findFirst({
    where: eq(organisations.slug, slug),
    columns: {},
    with: {
      events: {
        columns: {
          id: true,
          title: true,
          date: true,
          url: true,
          image: true,
        },
      },
    },
  });

  return data?.events.sort((a, b) => a.date.getTime() - b.date.getTime()) ?? [];
};
