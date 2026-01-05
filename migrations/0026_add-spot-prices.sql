CREATE TABLE "spot_price" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"price_eur_mwh" numeric(30, 6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulation_tou_tariff_settings" ADD COLUMN "pricing_mode" text DEFAULT 'tou' NOT NULL;--> statement-breakpoint
ALTER TABLE "simulation_tou_tariff_settings" ADD COLUMN "spot_markup" numeric(30, 6) DEFAULT 3;--> statement-breakpoint
CREATE UNIQUE INDEX "spot_price_timestamp_idx" ON "spot_price" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "spot_price_timestamp_range_idx" ON "spot_price" USING btree ("timestamp");--> statement-breakpoint

-- Schedule daily spot price fetch at 14:15 CET (13:15 UTC)
-- Day-ahead prices are published around 13:00 CET
SELECT cron.schedule(
	'fetch_spot_prices_cron',
	'15 13 * * *',
	$$SELECT send_check_request('/spot-prices');$$
);