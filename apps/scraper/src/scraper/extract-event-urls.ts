import { Browser } from "@playwright/test";
import { err, ok, Result } from "neverthrow";
import { type UrlError } from "../types/errors";

/**
 * Extracts event URLs from a given page
 * @param url - The URL of the page to extract event URLs from
 * @param browser - The browser instance
 * @param pattern - The pattern(s) to match the event URLs
 * @returns A promise that resolves to an array of event URLs
 */
export const extractEventUrls = async ({
  url,
  browser,
  pattern,
}: {
  url: string;
  browser: Browser;
  pattern: RegExp | RegExp[];
}): Promise<Result<string[], UrlError>> => {
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForLoadState("networkidle");

    const allLinks = await page.$$eval("a", (links) =>
      links.map((link) => link.href),
    );

    const filteredLinks = [
      ...new Set(
        allLinks.filter((href) =>
          Array.isArray(pattern)
            ? pattern.some((p) => p.test(href))
            : pattern.test(href),
        ),
      ),
    ].slice(0, 30);
    return ok(filteredLinks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return err({
      type: "PAGE_LOAD_ERROR",
      message,
      url,
    });
  } finally {
    await page.close();
  }
};
