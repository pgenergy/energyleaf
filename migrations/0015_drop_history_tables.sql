ALTER TABLE "history_device" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "history_user_data" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "history_user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "history_device" CASCADE;--> statement-breakpoint
DROP TABLE "history_user_data" CASCADE;--> statement-breakpoint
DROP TABLE "history_user" CASCADE;--> statement-breakpoint
ALTER TABLE "device_to_peak" DROP CONSTRAINT "device_to_peak_device_id_device_id_fk";
--> statement-breakpoint
ALTER TABLE "sensor_history" DROP CONSTRAINT "sensor_history_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "deleted" boolean DEFAULT false NOT NULL;
