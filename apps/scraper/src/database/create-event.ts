import { err, ok } from "neverthrow";
import { db, events } from "@repo/database";
import { forwardGeocode } from "@repo/geo";
import { CreateEventResult } from "../types/database";
import { Event } from "../types/event";
import { findEventByUrl } from "./find-event";

/**
 * Create an event in the database.
 * @param event The event to create.
 * @param organisationId The organisation ID.
 * @returns The result of the operation.
 */
export const createEvent = async (
  event: Event,
  organisationId: string,
): Promise<CreateEventResult> => {
  try {
    const existingEvent = await findEventByUrl(event.url);

    if (existingEvent.isErr()) {
      return err(existingEvent.error);
    }

    if (existingEvent.value) {
      return err({
        type: "DATABASE_ERROR",
        message: "Event already exists in database",
      });
    }

    const { latitude, longitude } = await forwardGeocode({
      address: event.location.address,
      city: event.location.city,
      country: event.location.country,
    });

    await db.insert(events).values({
      url: event.url,
      title: event.title,
      description: event.description,
      date: event.date,
      organisationId,
      image: event.image,
      address: event.location.address,
      city: event.location.city,
      country: event.location.country,
      location: {
        x: longitude,
        y: latitude,
      },
      lineup: event.lineup?.map((artist) => ({
        name: artist.name,
        stage: artist.stage,
        datetime: artist.datetime
          ? new Date(artist.datetime).toISOString()
          : null,
      })),
    });

    return ok(undefined);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: `Error creating event: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
