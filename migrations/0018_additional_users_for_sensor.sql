CREATE TABLE "sensor_additional_user" (
	"sensor_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sensor_additional_user" ADD CONSTRAINT "sensor_additional_user_sensor_id_sensor_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."sensor"("sensor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_additional_user" ADD CONSTRAINT "sensor_additional_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;