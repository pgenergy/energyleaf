ALTER TABLE "history_device" RENAME COLUMN "power_estimation" TO "power";--> statement-breakpoint
ALTER TABLE "device" RENAME COLUMN "power_estimation" TO "power";--> statement-breakpoint
ALTER TABLE "history_device" ADD COLUMN "is_power_estimated" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "device" ADD COLUMN "is_power_estimated" boolean DEFAULT true NOT NULL;