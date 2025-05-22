import { Browser, Page } from "@playwright/test";
import { err, ok, Result } from "neverthrow";
import { type EventError } from "../types/errors";
import { Event } from "../types/event";
import { Organisation } from "../types/organisation";
import { extractEvent } from "./extract-event-prompt";

/**
 * The content of a page
 */
interface PageContent {
  text: string;
  images: Array<{ url: string; alt: string }>;
}

/**
 * Validates if an image URL points to a supported format
 * @param url - The image URL to validate
 * @returns Whether the image format is supported
 */
function isSupportedImageFormat(url: string): boolean {
  const supportedFormats = [".png", ".jpeg", ".jpg", ".gif", ".webp"];
  return supportedFormats.some((format) => url.toLowerCase().includes(format));
}

/**
 * Extracts the content of a page
 * @param page - The page to extract the content from
 * @returns A promise that resolves to the content of the page
 */
async function extractPageContent(
  page: Page,
): Promise<Result<PageContent, EventError>> {
  try {
    const headings = await page
      .$$eval("h1, h2, h3, h4, h5, h6", (els) =>
        els
          .map((el) => (el as HTMLHeadingElement).innerText.trim())
          .filter(Boolean),
      )
      .catch(() => []);

    const paragraphs = await page
      .$$eval("p", (els) =>
        els.map((el) => el.innerText.trim()).filter(Boolean),
      )
      .catch(() => []);

    const spans = await page
      .$$eval("span", (els) =>
        els.map((el) => el.innerText.trim()).filter(Boolean),
      )
      .catch(() => []);

    const anchors = await page
      .$$eval("a", (els) =>
        els.map((el) => el.innerText.trim()).filter(Boolean),
      )
      .catch(() => []);

    const address = await page
      .$eval("address", (el) => el.innerText.trim())
      .catch(() => "");

    // Extract images with their URLs and alt text
    const images = await page
      .$$eval("img", (els) =>
        els
          .map((el) => ({
            url: el.getAttribute("src") || "",
            alt: el.getAttribute("alt") || "",
          }))
          .filter((img) => img.url && img.url.startsWith("https")),
      )
      .catch(() => []);

    // Filter out unsupported image formats
    const supportedImages = images.filter((img) =>
      isSupportedImageFormat(img.url),
    );

    return ok({
      text: [...headings, ...paragraphs, ...spans, ...anchors, address].join(
        "\n",
      ),
      images: supportedImages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return err({
      type: "EXTRACTION_ERROR",
      message,
      url: page.url(),
    });
  }
}

/**
 * Extracts event information from a given URL
 * @param url - The URL of the page to extract event information from
 * @param browser - The browser instance
 * @returns A promise that resolves to the event information
 */
async function extractEventInfo({
  url,
  browser,
  organisation,
}: {
  url: string;
  browser: Browser;
  organisation: Organisation;
}): Promise<Result<Event, EventError>> {
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {
      console.log(
        `Network idle timeout for ${url}, falling back to domcontentloaded`,
      );
      return page.waitForLoadState("domcontentloaded");
    });

    const content = await extractPageContent(page);
    if (content.isErr()) {
      return err(content.error);
    }

    const { text: body, images } = content.value;
    await page.close();

    return extractEvent({ url, body, images, organisation });
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
}

export { extractEventInfo };
