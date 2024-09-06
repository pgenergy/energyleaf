CREATE TABLE IF NOT EXISTS "device_suggestions_peak" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "device_suggestions_peak_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sensor_data_sequence_id" text NOT NULL,
	"device_category" text NOT NULL
);
