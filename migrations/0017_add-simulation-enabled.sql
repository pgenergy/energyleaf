CREATE TABLE "simulation_battery_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"capacity_kwh" numeric(30, 6) NOT NULL,
	"max_power_kw" numeric(30, 6) NOT NULL,
	"initial_state_of_charge" numeric(30, 6) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulation_battery_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "simulation_ev_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"charging_speed" text NOT NULL,
	"capacity_kwh" numeric(30, 6) NOT NULL,
	"max_charging_power_kw" numeric(30, 6) DEFAULT 11 NOT NULL,
	"daily_driving_distance_km" numeric(30, 6),
	"avg_consumption_per_100km" numeric(30, 6),
	"default_schedule" json DEFAULT '[]'::json NOT NULL,
	"weekday_schedules" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulation_ev_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "simulation_heat_pump_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"source" text NOT NULL,
	"power_kw" numeric(30, 6) NOT NULL,
	"buffer_liter" numeric(30, 6),
	"default_schedule" json DEFAULT '[]'::json NOT NULL,
	"weekday_schedules" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulation_heat_pump_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "simulation_solar_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"peak_power" numeric(30, 6) NOT NULL,
	"orientation" text NOT NULL,
	"inverter_power" numeric(30, 6),
	"sun_hours_per_day" numeric(30, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulation_solar_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "simulation_tou_tariff_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"base_price" numeric(30, 6) NOT NULL,
	"standard_price" numeric(30, 6) NOT NULL,
	"zones" json DEFAULT '[]'::json NOT NULL,
	"weekday_zones" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulation_tou_tariff_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_simulation_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "simulation_battery_settings" ADD CONSTRAINT "simulation_battery_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_ev_settings" ADD CONSTRAINT "simulation_ev_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_heat_pump_settings" ADD CONSTRAINT "simulation_heat_pump_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_solar_settings" ADD CONSTRAINT "simulation_solar_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulation_tou_tariff_settings" ADD CONSTRAINT "simulation_tou_tariff_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;