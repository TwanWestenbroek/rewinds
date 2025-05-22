/**
 * Base error type for all scraping-related errors
 */
export type BaseError = {
  message: string;
  url?: string;
};

/**
 * Error types for URL extraction
 */
export type UrlError = BaseError & {
  type: "PAGE_LOAD_ERROR" | "EXTRACTION_ERROR";
};

/**
 * Error types for event extraction
 */
export type EventError =
  | {
      type: "PAGE_LOAD_ERROR";
      message: string;
      url: string;
    }
  | {
      type: "EXTRACTION_ERROR";
      message: string;
      url: string;
    }
  | {
      type: "OLLAMA_ERROR";
      message: string;
      url: string;
    }
  | {
      type: "PARSE_ERROR";
      message: string;
      url: string;
    }
  | {
      type: "DATABASE_ERROR";
      message: string;
      url: string;
    }
  | {
      type: "EVENT_EXISTS";
      message: string;
      url: string;
    }
  | {
      type: "OPENAI_ERROR";
      message: string;
      url: string;
    };

/**
 * Error types for browser operations
 */
export type BrowserError = BaseError & {
  type: "BROWSER_ERROR";
};

/**
 * Union type of all possible scraping errors
 */
export type ScrapeError = UrlError | EventError | BrowserError;
