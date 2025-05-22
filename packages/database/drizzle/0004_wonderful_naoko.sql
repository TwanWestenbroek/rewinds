ALTER TABLE "organisations" ADD COLUMN "url" text;--> statement-breakpoint
UPDATE "organisations" SET "url" = CONCAT('https://', "slug", '.com');--> statement-breakpoint
ALTER TABLE "organisations" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_url_unique" UNIQUE("url");