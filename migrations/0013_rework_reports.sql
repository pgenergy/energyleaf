ALTER TABLE "report_config" RENAME TO "legacy_report_config";--> statement-breakpoint
ALTER TABLE "report_data" RENAME TO "legacy_report_data";--> statement-breakpoint
ALTER TABLE "reports_day_statistics" RENAME TO "legacy_reports_day_statistics";--> statement-breakpoint
ALTER TABLE "legacy_report_config" DROP CONSTRAINT "report_config_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy_report_data" DROP CONSTRAINT "report_data_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "page_views" RENAME COLUMN "search_params" TO "legacy_search_params";--> statement-breakpoint
ALTER TABLE "page_views" DROP COLUMN "legacy_search_params";--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "search_params" json;--> statement-breakpoint
ALTER TABLE "history_user_data" ALTER COLUMN "living_space" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "history_user_data" ALTER COLUMN "advance_payment_electricity" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "history_user" ALTER COLUMN "user_timezone" SET DEFAULT 'europe_berlin';--> statement-breakpoint
ALTER TABLE "user_data" ALTER COLUMN "living_space" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "user_data" ALTER COLUMN "advance_payment_electricity" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "user_timezone" SET DEFAULT 'europe_berlin';--> statement-breakpoint
ALTER TABLE "legacy_report_config" ADD CONSTRAINT "legacy_report_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_report_data" ADD CONSTRAINT "legacy_report_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
