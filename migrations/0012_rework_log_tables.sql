CREATE TABLE "action_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"app_function" text NOT NULL,
	"action" text NOT NULL,
	"details" json
);
--> statement-breakpoint
CREATE TABLE "error_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"app_function" text NOT NULL,
	"details" json
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"path" text NOT NULL,
	"search_params" text,
	"user_agent" text,
	"user_id" text,
	"session_id" text NOT NULL,
	"params" json
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now(),
	"title" text NOT NULL,
	"details" json
);
--> statement-breakpoint
ALTER TABLE "logs" RENAME TO "legacy_logs";--> statement-breakpoint
ALTER TABLE "history_device" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "history_device" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "history_device" ALTER COLUMN "device_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "device" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "device_to_peak" DROP CONSTRAINT "device_to_peak_device_id_device_id_fk";--> statement-breakpoint
ALTER TABLE "device" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "device_to_peak" ALTER COLUMN "device_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "device_to_peak" ADD CONSTRAINT "device_to_peak_device_id_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."device"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_logs" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "legacy_logs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "history_report_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "history_report_config" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "report_config" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "report_config" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "history_user_data" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "history_user_data" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_data" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "user_data" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "history_user_data" ADD COLUMN "current_energy_threshold" numeric(30, 6);--> statement-breakpoint
ALTER TABLE "history_user" ADD COLUMN "user_timezone" text DEFAULT 'Europe/Berlin';--> statement-breakpoint
ALTER TABLE "token" ADD COLUMN "type" text;--> statement-breakpoint
ALTER TABLE "user_data" ADD COLUMN "current_energy_threshold" numeric(30, 6);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_timezone" text DEFAULT 'Europe/Berlin';
