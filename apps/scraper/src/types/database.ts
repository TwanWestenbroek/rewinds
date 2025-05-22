import { Result } from "neverthrow";

/**
 * The error type for database operations.
 */
export type DatabaseError = {
  type: "DATABASE_ERROR";
  message: string;
};

/**
 * The result of creating an organisation.
 */
export type CreateOrganisationResult = Result<string, DatabaseError>;

/**
 * The result of creating an event.
 */
export type CreateEventResult = Result<void, DatabaseError>;

/**
 * The result of finding an event.
 */
export type FindEventResult = Result<boolean | null, DatabaseError>;
