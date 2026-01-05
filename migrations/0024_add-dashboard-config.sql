CREATE TABLE "dashboard_config" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"active_components" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "dashboard_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "dashboard_config" ADD CONSTRAINT "dashboard_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
