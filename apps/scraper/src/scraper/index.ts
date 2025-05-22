import { chromium } from "@playwright/test";
import { err, ok, Result } from "neverthrow";
import { createEvent } from "../database/create-event";
import { type EventError, type ScrapeError } from "../types/errors";
import { Event } from "../types/event";
import { Organisation, SCRAPER_CONFIG } from "../types/organisation";
import { processBatch } from "../utils/process-batch";
import { extractEventInfo } from "./extract-event-info";
import { extractEventUrls } from "./extract-event-urls";

/**
 * Scrapes events from a given organisation
 * @param organisation - The organisation to scrape events from
 * @param organisationId - The ID of the organisation in the database
 * @returns An array of events
 */
const scrape = async ({
  organisation,
  organisationId,
}: {
  organisation: Organisation;
  organisationId: string;
}): Promise<Result<Event[], ScrapeError>> => {
  const browser = await chromium.launch({
    headless: SCRAPER_CONFIG[organisation].headless,
  });
  const url = SCRAPER_CONFIG[organisation].url as string;
  const pattern = SCRAPER_CONFIG[organisation].pattern as RegExp;
  const successfulEvents: Event[] = [];
  const failedUrls: { url: string; error: string }[] = [];

  try {
    console.log(`Starting to scrape ${organisation} from ${url}`);

    const urlsResult = await extractEventUrls({ url, browser, pattern });
    if (urlsResult.isErr()) {
      return err(urlsResult.error);
    }

    const eventUrls = urlsResult.value;
    console.log(`Found ${eventUrls.length} event URLs to process`);

    const results = await processBatch<string, Result<Event, EventError>>(
      eventUrls,
      async (url) => {
        console.log("Processing event URL: ", url);

        const eventResult = await extractEventInfo({
          url,
          browser,
          organisation,
        });
        if (eventResult.isErr()) {
          return eventResult;
        }

        const event = eventResult.value;
        const createdEvent = await createEvent(event, organisationId);
        if (createdEvent.isErr()) {
          return err({
            type: "DATABASE_ERROR",
            message: createdEvent.error.message,
            url,
          });
        }

        console.log(`Created event ${event.title}`);
        return ok(event);
      },
      3,
    );

    // Process results sequentially to maintain order and proper logging
    for (const result of results) {
      if (result.isOk()) {
        successfulEvents.push(result.value);
      } else {
        const error = result.error;
        if (error.type === "EVENT_EXISTS") {
          // Skip logging for events that already exist
          continue;
        }
        console.error(
          `Failed to process event URL ${error.url || "unknown"}:`,
          error.message,
        );
        failedUrls.push({
          url: error.url || "unknown",
          error: error.message,
        });
      }
    }

    console.log(`\nScraping summary for ${organisation}:`);
    console.log(`Successfully processed: ${successfulEvents.length} events`);
    console.log(`Failed to process: ${failedUrls.length} events`);

    if (failedUrls.length > 0) {
      console.log("\nFailed URLs:");
      failedUrls.forEach(({ url, error }) => {
        console.log(`- ${url}: ${error}`);
      });
    }

    return ok(successfulEvents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Critical error while scraping ${organisation}:`, message);
    return err({
      type: "BROWSER_ERROR",
      message,
    });
  } finally {
    await browser.close();
    console.log(`Browser closed for ${organisation}`);
  }
};

export { scrape };
