CREATE TABLE "report_config" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"receive_mails" boolean DEFAULT true NOT NULL,
	"anomaly" boolean DEFAULT false NOT NULL,
	"days" json DEFAULT '[]'::json
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"data" json NOT NULL
);
--> statement-breakpoint
DROP TABLE "history_report_config" CASCADE;--> statement-breakpoint
DROP TABLE "legacy_report_config" CASCADE;--> statement-breakpoint
DROP TABLE "legacy_report_data" CASCADE;--> statement-breakpoint
DROP TABLE "legacy_reports_day_statistics" CASCADE;--> statement-breakpoint
ALTER TABLE "report_config" ADD CONSTRAINT "report_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;