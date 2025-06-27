CREATE TABLE IF NOT EXISTS "device" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"power_estimation" numeric(30, 6),
	"weekly_usage_estimation" numeric(30, 6)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history_device" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "history_device_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"power_estimation" numeric(30, 6),
	"weekly_usage_estimation" numeric(30, 6),
	"device_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "device_to_peak" (
	"device_id" integer NOT NULL,
	"sensor_data_sequence_id" text NOT NULL,
	CONSTRAINT "device_to_peak_device_id_sensor_data_sequence_id_pk" PRIMARY KEY("device_id","sensor_data_sequence_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"timestamp" timestamp with time zone DEFAULT now(),
	"title" varchar(128) NOT NULL,
	"log_type" text DEFAULT 'undefined',
	"app_function" varchar(128) NOT NULL,
	"app_component" text DEFAULT 'undefined',
	"details" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history_report_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "history_report_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"receive_mails" boolean DEFAULT true NOT NULL,
	"interval" integer DEFAULT 3 NOT NULL,
	"time" integer DEFAULT 6 NOT NULL,
	"timestamp_last" timestamp with time zone DEFAULT '2020-01-01 00:00:00' NOT NULL,
	"created_timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_config" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "report_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"receive_mails" boolean DEFAULT true NOT NULL,
	"interval" integer DEFAULT 3 NOT NULL,
	"time" integer DEFAULT 6 NOT NULL,
	"timestamp_last" timestamp with time zone DEFAULT '2020-01-01 00:00:00' NOT NULL,
	"created_timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_data" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"date_from" timestamp with time zone DEFAULT now() NOT NULL,
	"date_to" timestamp with time zone DEFAULT now() NOT NULL,
	"total_energy_consumption" double precision NOT NULL,
	"avg_energy_consumption_per_day" double precision NOT NULL,
	"total_energy_cost" double precision,
	"avg_energy_cost" double precision,
	"worst_day" timestamp with time zone NOT NULL,
	"worst_day_consumption" double precision NOT NULL,
	"best_day" timestamp with time zone NOT NULL,
	"best_day_consumption" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports_day_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"daily_consumption" double precision NOT NULL,
	"daily_goal" double precision,
	"exceeded" boolean,
	"progress" double precision,
	"report_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_data_sequence" (
	"id" text PRIMARY KEY NOT NULL,
	"sensor_id" text NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"average_peak_power" numeric(30, 6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_data" (
	"id" text NOT NULL,
	"sensor_id" text NOT NULL,
	"value" numeric(30, 6) NOT NULL,
	"consumption" numeric(30, 6) NOT NULL,
	"value_out" numeric(30, 6),
	"inserted" numeric(30, 6),
	"value_current" numeric(30, 6),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sensor_data_sensor_id_timestamp_pk" PRIMARY KEY("sensor_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_history" (
	"sensor_id" text NOT NULL,
	"user_id" text NOT NULL,
	"sensor_type" text NOT NULL,
	"client_id" text NOT NULL,
	CONSTRAINT "sensor_history_client_id_user_id_pk" PRIMARY KEY("client_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_sequence_marking_log" (
	"sensor_id" text NOT NULL,
	"sequence_type" text NOT NULL,
	"last_marked" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sensor_sequence_marking_log_sensor_id_sequence_type_pk" PRIMARY KEY("sensor_id","sequence_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor" (
	"sensor_id" text NOT NULL,
	"client_id" text PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"sensor_type" text NOT NULL,
	"user_id" text,
	"needs_script" boolean DEFAULT false NOT NULL,
	"script" text,
	CONSTRAINT "sensor_sensor_id_unique" UNIQUE("sensor_id"),
	CONSTRAINT "sensor_sensor_type_user_id_unique" UNIQUE("sensor_type","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_token" (
	"code" text PRIMARY KEY NOT NULL,
	"sensor_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history_user" (
	"id" text PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"email" text NOT NULL,
	"phone" text,
	"address" text DEFAULT '' NOT NULL,
	"firstname" text DEFAULT '' NOT NULL,
	"lastname" text DEFAULT '' NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_participant" boolean DEFAULT false NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"app_version" smallint DEFAULT 0 NOT NULL,
	"receive_anomaly_mails" boolean DEFAULT true NOT NULL,
	"activation_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "history_user_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "history_user_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"base_price" double precision,
	"working_price" double precision,
	"tariff" text DEFAULT 'basic',
	"household" integer,
	"property" text,
	"living_space" integer,
	"hot_water" text,
	"advance_payment_electricity" integer,
	"consumption_goal" double precision,
	"electricity_meter_number" text,
	"electricity_meter_type" text,
	"electricity_meter_img_url" text,
	"power_at_electricity_meter" boolean DEFAULT false,
	"wifi_at_electricity_meter" boolean DEFAULT false,
	"installation_comment" text,
	"device_power_estimation_r_squared" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"email" text NOT NULL,
	"phone" text,
	"address" text DEFAULT '' NOT NULL,
	"firstname" text DEFAULT '' NOT NULL,
	"lastname" text DEFAULT '' NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_participant" boolean DEFAULT false NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"app_version" smallint DEFAULT 0 NOT NULL,
	"receive_anomaly_mails" boolean DEFAULT true NOT NULL,
	"activation_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"base_price" double precision,
	"working_price" double precision,
	"tariff" text DEFAULT 'basic',
	"household" integer,
	"property" text,
	"living_space" integer,
	"hot_water" text,
	"advance_payment_electricity" integer,
	"consumption_goal" double precision,
	"electricity_meter_number" text,
	"electricity_meter_type" text,
	"electricity_meter_img_url" text,
	"power_at_electricity_meter" boolean DEFAULT false,
	"wifi_at_electricity_meter" boolean DEFAULT false,
	"installation_comment" text,
	"device_power_estimation_r_squared" double precision
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_experiment_data" (
	"user_id" text PRIMARY KEY NOT NULL,
	"experiment_status" text,
	"installation_date" timestamp with time zone,
	"deinstallation_date" timestamp with time zone,
	"experiment_number" integer,
	"gets_paid" boolean DEFAULT false NOT NULL,
	"uses_prolific" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tip_of_the_day" (
	"user_id" text PRIMARY KEY NOT NULL,
	"tip_id" integer NOT NULL,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "senor_data_sequence_sensor_id_start" ON "sensor_data_sequence" USING btree ("sensor_id","start");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "senor_data_sequence_sensor_id_end" ON "sensor_data_sequence" USING btree ("sensor_id","end");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "senor_data_sequence_sensor_id" ON "sensor_data_sequence" USING btree ("sensor_id","start","end");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_id_idx_sensor_token" ON "sensor_token" USING btree ("sensor_id");
