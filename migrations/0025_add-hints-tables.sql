CREATE TABLE "hint_config" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stage" text DEFAULT 'simple' NOT NULL,
	"stage_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hints_enabled" boolean DEFAULT true NOT NULL,
	"hints_days_seen_in_stage" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "hint_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"for_date" timestamp with time zone NOT NULL,
	"hint_type" text NOT NULL,
	"hint_stage" text NOT NULL,
	"hint_text" text NOT NULL,
	"link_target" text NOT NULL,
	"seen" boolean DEFAULT false NOT NULL,
	"seen_at" timestamp with time zone,
	"clicked" boolean DEFAULT false NOT NULL,
	"clicked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "hint_config" ADD CONSTRAINT "hint_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Create pgmq queue for hints processing
SELECT pgmq.create('hints_queue');--> statement-breakpoint

-- Schedule daily hint generation job at 06:00 UTC (queues users to hints_queue)
SELECT cron.schedule(
	'check_hints_cron',
	'0 6 * * *',
	$$SELECT send_check_request('/hints');$$
);--> statement-breakpoint

-- Schedule hint queue processing every 5 minutes
SELECT cron.schedule(
	'process_hints_cron',
	'*/5 * * * *',
	$$SELECT send_process_request('/hints', 'hints_queue');$$
);