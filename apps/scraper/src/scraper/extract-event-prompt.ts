import { err, ok, Result } from "neverthrow";
import { openai } from "../openai";
import { type EventError } from "../types/errors";
import { Event } from "../types/event";
import { Organisation, ORGANISATION_MAP } from "../types/organisation";

/**
 * Extracts event information using OpenAI's GPT-4o model
 * @param url - The URL of the page being analyzed
 * @param body - The HTML content to analyze
 * @param images - The images to use in the prompt
 * @param organisation - The organisation to use in the prompt
 * @returns A promise that resolves to the extracted event information
 */
export async function extractEvent({
  url,
  body,
  images,
  organisation,
}: {
  url: string;
  body: string;
  images: { url: string; alt: string }[];
  organisation: Organisation;
}): Promise<Result<Event, EventError>> {
  images = images.slice(0, 5);
  body = body.trim().replace(/\n/g, " ").slice(0, 15000);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are an expert at extracting structured event data from raw HTML and images. Follow strict validation rules and never infer, assume, or fabricate missing data.

TASK:
1. First, analyze each provided image to extract relevant event information
2. Then, combine the image analysis with the HTML content to extract complete event data
3. Return structured event data ONLY IF all required fields are present, specific, and valid

IMAGE ANALYSIS RULES:
1. For each image, identify:
   - Any performers, artists, or speakers visible
   - Event-related details (venue, branding, etc.)
   - Any text or information visible in the image
   - The overall context and relevance to an event
2. Be specific and detailed in your analysis
3. Use image information to confirm or enhance HTML content, never to override it

EVENT EXTRACTION RULES:

GENERAL:
1. Remove all HTML tags and special characters
2. Normalize line breaks — only preserve them between meaningful sections or paragraphs
3. Use clear, grammatically correct language and punctuation
4. Detect the language of the content and respond in the same language
5. If the language is unclear or undetectable, default to the primary language for the event's country code (e.g. Dutch for "NL", German for "DE")
6. Do not include ticket prices and ticket links in the description
7. Never fabricate or guess values. Only include content that is explicitly stated or reliably confirmed

REQUIRED FIELDS:

1. Title:
   - Must be a clear and specific event name
   - Prefer titles from HTML; use image analysis only if HTML content is missing or too vague
   - Normalize consistent patterns (e.g., "Series + Date - Headliner")
   - Do not use placeholders like "TBA", "Unknown", etc.

2. Date:
   - Must be in full ISO 8601 format: YYYY-MM-DDTHH:mm±hh:mm
   - Must include a valid IANA timezone offset based on the event's country
   - Do not use vague terms like "evening" or "night"

3. Location:
   - Must include:
     - City (required)
     - ISO 3166-1 alpha-2 country code (required)
     - Street address (optional if not specified)
   - If city or country is missing, return: { "invalid": true }

4. Description:
   - Must include:
     - Names of featured artists, speakers, or acts
     - Event type or genre (e.g., techno night, rap concert, conference)
     - Schedule details if available (e.g., "Doors open at 21:00", "18+ only")
   - Use HTML content as the primary source
   - Use image analysis only to confirm or enhance, not replace, the description

5. Image:
   - Select the most relevant promotional or event-specific image from the provided images
   - Return null only if no clearly relevant image is available
   - Do not return null if a header, flyer, or artist promo image exists

6. Lineup (optional):
   - Include only performer stage names
   - If individuals perform under a known group name, include only the group name (e.g., "Dual Damage", not "Thijs Rooijakkers")
   - Do not include company, venue, or organization names - Venue name ${ORGANISATION_MAP[organisation].name}
   - Use image analysis to support or clarify lineup data, but not to guess
   - Include a datetime only if it is explicitly linked to the performer and includes a valid IANA timezone offset
   - Include a stage only if it is clearly named and tied to the performer
   - Return an empty array if lineup is missing, incomplete, or ambiguous

VALIDATION:
If any required field is missing, vague, generic, or uses placeholders, return:

{ "invalid": true }

OUTPUT FORMAT:
Return only a single JSON object with the following structure:

{
  "invalid": false,
  "title": "string",
  "date": "YYYY-MM-DDTHH:mm±hh:mm or YYYY-MM-DD",
  "description": "string",
  "location": {
    "city": "string",
    "address": "string",
    "country": "ISO country code"
  },
  "image": "string or null",
  "lineup": [
    {
      "name": "string",
      "stage": "string or null",
      "datetime": "YYYY-MM-DDTHH:mm±hh:mm or null"
    }
  ]
}

Example:

{
  "invalid": false,
  "title": "Saturday 31 May 2025 - Josylvio",
  "date": "2025-05-31T21:00+02:00",
  "description": "Josylvio treedt op tijdens een avond vol Nederlandse hiphop. Deuren openen om 21:00.",
  "location": {
    "city": "Markelo",
    "address": "Oude Rijssenseweg 11",
    "country": "NL"
  },
  "image": "https://example.com/flyer-josylvio.jpg",
  "lineup": [
    {
      "name": "Josylvio",
      "stage": null,
      "datetime": null
    }
  ]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract event data from the following content:",
            },
            {
              type: "text",
              text: `Here are the available images:\n${images
                .map((img, i) => `Image ${i + 1}: ${img.url}`)
                .join(
                  "\n",
                )}\n\nRefer to these URLs when selecting the most relevant promotional image.`,
            },
            ...images.map((image) => ({
              type: "image_url" as const,
              image_url: {
                url: image.url,
              },
            })),
            { type: "text", text: `\nHTML CONTENT:\n${body}` },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 10000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return err({
        type: "OPENAI_ERROR",
        message: "No response from OpenAI",
        url,
      });
    }

    try {
      const parsedResponse = JSON.parse(content);

      if (parsedResponse.invalid === true) {
        return err({
          type: "PARSE_ERROR",
          message: "Invalid event data or not an event page",
          url,
        });
      }

      if (
        !parsedResponse.title ||
        !parsedResponse.date ||
        !parsedResponse.location
      ) {
        return err({
          type: "PARSE_ERROR",
          message: "Missing required event fields",
          url,
        });
      }

      return ok({
        ...parsedResponse,
        url,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return err({
        type: "PARSE_ERROR",
        message: `Failed to parse OpenAI response: ${message}`,
        url,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return err({
      type: "OPENAI_ERROR",
      message: `Failed to extract event: ${message}`,
      url,
    });
  }
}
