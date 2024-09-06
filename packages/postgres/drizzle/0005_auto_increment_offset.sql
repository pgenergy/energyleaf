ALTER TABLE "history_device" ALTER COLUMN "id" SET START WITH 48;--> statement-breakpoint
ALTER TABLE "device" ALTER COLUMN "id" SET START WITH 48;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "id" SET START WITH 81597;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "app_function" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "history_report_config" ALTER COLUMN "id" SET START WITH 106;--> statement-breakpoint
ALTER TABLE "report_config" ALTER COLUMN "id" SET START WITH 106;--> statement-breakpoint
ALTER TABLE "history_user_data" ALTER COLUMN "id" SET START WITH 124;--> statement-breakpoint
ALTER TABLE "user_data" ALTER COLUMN "id" SET START WITH 124;