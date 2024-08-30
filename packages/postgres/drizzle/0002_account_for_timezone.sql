-- Custom SQL migration file, put you code below! --
DROP MATERIALIZED VIEW IF EXISTS "sensor_data_hour";--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "sensor_data_day";--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "sensor_data_week";--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "sensor_data_month";--> statement-breakpoint

CREATE MATERIALIZED VIEW "sensor_data_hour" WITH (timescaledb.continuous = true) AS
    SELECT
        sensor_id AS sensor_id,
        time_bucket('1 hour', timestamp, 'Europe/Berlin') AS bucket,
        MAX(value) AS max_value,
        MIN(value) AS min_value,
        MAX(value_out) AS max_value_out,
        MIN(value_out) AS min_value_out,
        AVG(value_current) AS avg_value_current,
        MAX(value_current) AS max_value_current,
        MIN(value_current) AS min_value_current,
        AVG(consumption) AS avg_consumption,
        SUM(consumption) AS sum_consumption,
        AVG(inserted) AS avg_inserted,
        SUM(inserted) AS sum_inserted,
        MAX(timestamp) AS max_timestamp,
        MIN(timestamp) AS min_timestamp
    FROM sensor_data
    GROUP BY sensor_id, bucket
    WITH NO DATA;
--> statement-breakpoint

SELECT add_continuous_aggregate_policy('sensor_data_hour',
  start_offset => INTERVAL '4 hours',
  end_offset   => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');
--> statement-breakpoint

CREATE MATERIALIZED VIEW "sensor_data_day" WITH (timescaledb.continuous = true) AS
    SELECT
        sensor_id AS sensor_id,
        time_bucket('1 day', timestamp, 'Europe/Berlin') AS bucket,
        MAX(value) AS max_value,
        MIN(value) AS min_value,
        MAX(value_out) AS max_value_out,
        MIN(value_out) AS min_value_out,
        AVG(value_current) AS avg_value_current,
        MAX(value_current) AS max_value_current,
        MIN(value_current) AS min_value_current,
        AVG(consumption) AS avg_consumption,
        SUM(consumption) AS sum_consumption,
        AVG(inserted) AS avg_inserted,
        SUM(inserted) AS sum_inserted,
        MAX(timestamp) AS max_timestamp,
        MIN(timestamp) AS min_timestamp
    FROM sensor_data
    GROUP BY sensor_id, bucket
    WITH NO DATA;
--> statement-breakpoint

SELECT add_continuous_aggregate_policy('sensor_data_day',
  start_offset => INTERVAL '4 days',
  end_offset   => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day');
--> statement-breakpoint

CREATE MATERIALIZED VIEW "sensor_data_week" WITH (timescaledb.continuous = true) AS
    SELECT
        sensor_id AS sensor_id,
        time_bucket('1 week', timestamp, 'Europe/Berlin') AS bucket,
        MAX(value) AS max_value,
        MIN(value) AS min_value,
        MAX(value_out) AS max_value_out,
        MIN(value_out) AS min_value_out,
        AVG(value_current) AS avg_value_current,
        MAX(value_current) AS max_value_current,
        MIN(value_current) AS min_value_current,
        AVG(consumption) AS avg_consumption,
        SUM(consumption) AS sum_consumption,
        AVG(inserted) AS avg_inserted,
        SUM(inserted) AS sum_inserted,
        MAX(timestamp) AS max_timestamp,
        MIN(timestamp) AS min_timestamp
    FROM sensor_data
    GROUP BY sensor_id, bucket
    WITH NO DATA;
--> statement-breakpoint

SELECT add_continuous_aggregate_policy('sensor_data_week',
  start_offset => INTERVAL '4 weeks',
  end_offset   => INTERVAL '1 week',
  schedule_interval => INTERVAL '1 week');
--> statement-breakpoint

CREATE MATERIALIZED VIEW "sensor_data_month" WITH (timescaledb.continuous = true) AS
    SELECT
        sensor_id AS sensor_id,
        time_bucket('1 month', timestamp, 'Europe/Berlin') AS bucket,
        MAX(value) AS max_value,
        MIN(value) AS min_value,
        MAX(value_out) AS max_value_out,
        MIN(value_out) AS min_value_out,
        AVG(value_current) AS avg_value_current,
        MAX(value_current) AS max_value_current,
        MIN(value_current) AS min_value_current,
        AVG(consumption) AS avg_consumption,
        SUM(consumption) AS sum_consumption,
        AVG(inserted) AS avg_inserted,
        SUM(inserted) AS sum_inserted,
        MAX(timestamp) AS max_timestamp,
        MIN(timestamp) AS min_timestamp
    FROM sensor_data
    GROUP BY sensor_id, bucket
    WITH NO DATA;

SELECT add_continuous_aggregate_policy('sensor_data_month',
  start_offset => INTERVAL '4 months',
  end_offset   => INTERVAL '1 month',
  schedule_interval => INTERVAL '1 month');
--> statement-breakpoint
