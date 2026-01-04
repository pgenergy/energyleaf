CREATE TABLE "tou_tariff_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" double precision NOT NULL,
	"standard_price" double precision NOT NULL,
	"zones" json DEFAULT '[]'::json NOT NULL,
	"weekday_zones" json DEFAULT '{}'::json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tou_tariff_template_name_unique" UNIQUE("name")
);
