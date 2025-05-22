import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";
import { db, events } from "@repo/database";
import { FindEventResult } from "../types/database";

/**
 * Find an event by its URL.
 * @param url The URL of the event.
 * @returns The result of the operation.
 */
export const findEventByUrl = async (url: string): Promise<FindEventResult> => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.url, url),
    });

    if (!event) {
      return ok(false);
    }

    return ok(true);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: `Error finding event: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
