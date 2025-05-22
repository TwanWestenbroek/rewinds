import { relations } from "drizzle-orm";
import {
  geometry,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * The events table.
 */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    address: text("address"),
    city: text("city").notNull(),
    country: text("country").notNull(),
    location: geometry("location", {
      type: "point",
      mode: "xy",
      srid: 4326,
    }).notNull(),
    image: text("image"),
    lineup: jsonb("lineup")
      .$type<
        {
          name: string;
          stage: string | null;
          datetime: string | null;
        }[]
      >()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    organisationId: uuid("organisation_id")
      .references(() => organisations.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (t) => [index("spatial_index").using("gist", t.location)],
);

/**
 * The organisations table.
 */
export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const organisationsRelations = relations(organisations, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  organisation: one(organisations, {
    fields: [events.organisationId],
    references: [organisations.id],
  }),
}));
