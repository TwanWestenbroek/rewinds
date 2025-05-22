ALTER TABLE "events" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "location" geometry(point) NOT NULL;--> statement-breakpoint
CREATE INDEX "spatial_index" ON "events" USING gist ("location");