import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";
import { db, organisations } from "@repo/database";
import { CreateOrganisationResult } from "../types/database";
import { Organisation, ORGANISATION_MAP } from "../types/organisation";

/**
 * Create an organisation in the database.
 * @param organisation The organisation to create.
 * @returns The result of the operation.
 */
export const createOrganisation = async (
  organisation: Organisation,
): Promise<CreateOrganisationResult> => {
  try {
    const organisationDetails = ORGANISATION_MAP[organisation];
    const existingOrganisation = await db.query.organisations.findFirst({
      where: eq(organisations.slug, organisationDetails.slug),
    });

    if (existingOrganisation?.id) {
      return ok(existingOrganisation.id);
    }

    const [newOrg] = await db
      .insert(organisations)
      .values({
        slug: organisationDetails.slug,
        url: organisationDetails.url,
        name: organisationDetails.name,
      })
      .returning();

    if (!newOrg?.id) {
      return err({
        type: "DATABASE_ERROR",
        message: `Failed to create organisation: ${organisationDetails.name}`,
      });
    }

    return ok(newOrg.id);
  } catch (error) {
    return err({
      type: "DATABASE_ERROR",
      message: `Error creating organisation: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
