DROP MATERIALIZED VIEW IF EXISTS sensor_data_hour;--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS sensor_data_day;--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS sensor_data_week;--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS sensor_data_month;--> statement-breakpoint
ALTER TABLE "user_tip_of_the_day" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_tip_of_the_day" CASCADE;--> statement-breakpoint
ALTER TABLE "sensor_data_sequence" RENAME TO "energy_data_sequence";--> statement-breakpoint
ALTER TABLE "sensor_data" RENAME TO "energy_data";--> statement-breakpoint
ALTER TABLE "device_to_peak" RENAME COLUMN "sensor_data_sequence_id" TO "energy_data_sequence_id";--> statement-breakpoint
ALTER TABLE "sensor" DROP CONSTRAINT "sensor_sensor_type_user_id_unique";--> statement-breakpoint
DROP INDEX "senor_data_sequence_sensor_id_start";--> statement-breakpoint
DROP INDEX "senor_data_sequence_sensor_id_end";--> statement-breakpoint
DROP INDEX "senor_data_sequence_sensor_id";--> statement-breakpoint
DROP INDEX "sensor_id_idx_sensor_token";--> statement-breakpoint
ALTER TABLE "device_to_peak" DROP CONSTRAINT "device_to_peak_device_id_sensor_data_sequence_id_pk";--> statement-breakpoint
ALTER TABLE "energy_data" DROP CONSTRAINT "sensor_data_sensor_id_timestamp_pk";--> statement-breakpoint
ALTER TABLE "sensor_history" DROP CONSTRAINT "sensor_history_client_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_to_peak" ADD CONSTRAINT "device_to_peak_device_id_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."device"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_to_peak" ADD CONSTRAINT "device_to_peak_energy_data_sequence_id_energy_data_sequence_id_fk" FOREIGN KEY ("energy_data_sequence_id") REFERENCES "public"."energy_data_sequence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_config" ADD CONSTRAINT "report_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_data" ADD CONSTRAINT "report_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_data_sequence" ADD CONSTRAINT "energy_data_sequence_sensor_id_sensor_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."sensor"("sensor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_history" ADD CONSTRAINT "sensor_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor" ADD CONSTRAINT "sensor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_token" ADD CONSTRAINT "sensor_token_sensor_id_sensor_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."sensor"("sensor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_data" ADD CONSTRAINT "user_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_user" DROP COLUMN "app_version";--> statement-breakpoint
ALTER TABLE "history_user" DROP COLUMN "receive_anomaly_mails";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "app_version";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "receive_anomaly_mails";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");--> statement-breakpoint
