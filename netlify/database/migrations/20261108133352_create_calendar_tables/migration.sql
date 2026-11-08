CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY,
	"source" text NOT NULL,
	"uid" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_sources" (
	"source" text PRIMARY KEY,
	"last_synced_at" timestamp NOT NULL,
	"last_status" text NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "calendar_events_source_uid_idx" ON "calendar_events" ("source","uid");