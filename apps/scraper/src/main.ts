import "dotenv/config";
import { err, Result } from "neverthrow";
import { createOrganisation } from "./database/create-organisation";
import { scrape } from "./scraper";
import { type ScrapeError } from "./types/errors";
import { Event } from "./types/event";
import { Organisation, SCRAPER_CONFIG } from "./types/organisation";
import { processBatch } from "./utils/process-batch";

/**
 * The result of scraping an organisation
 */
type ScrapeResult = {
  organisation: Organisation;
  result: Result<Event[], ScrapeError>;
};

/**
 * Main function to scrape events from all organisations
 */
const main = async () => {
  await processBatch<Organisation, ScrapeResult>(
    [...Organisation],
    async (organisation) => {
      // Create organisation first
      const organisationResult = await createOrganisation(organisation);

      return organisationResult.match(
        async (organisationId) => {
          const result = await scrape({ organisation, organisationId });
          return {
            organisation,
            result,
          };
        },
        async (error) => {
          console.error(
            `Failed to create organisation ${organisation}:`,
            error.message,
          );
          return {
            organisation,
            result: err({
              type: "DATABASE_ERROR",
              message: error.message,
              url: SCRAPER_CONFIG[organisation].url,
            }),
          };
        },
      );
    },
    1,
  );
};

main();
