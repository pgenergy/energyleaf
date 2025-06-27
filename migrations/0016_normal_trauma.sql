ALTER TABLE "energy_data" RENAME TO "energy_data_backup";--> statement-breakpoint

CREATE TABLE "energy_data" (
	LIKE "energy_data_backup" INCLUDING ALL
) PARTITION BY RANGE (timestamp);--> statement-breakpoint

CREATE SCHEMA IF NOT EXISTS sensor_partitions;--> statement-breakpoint

CREATE OR REPLACE FUNCTION sensor_partitions.create_weekly_partition(
	p_date   date,
	p_modulus int    DEFAULT 16,
	p_schema  text   DEFAULT 'sensor_partitions'
)
RETURNS void
LANGUAGE plpgsql
AS $MAIN$
DECLARE
	start_date  date := date_trunc('week', p_date)::date;  -- Monday of the week
	end_date    date := start_date + interval '7 days';   -- Following Monday
	week_num    text := to_char(start_date, 'IYYY_IW');   -- ISO year and week
	base_name   text := format('energy_data_%s', week_num);
	parent_fq   text := format('%I.%I', p_schema, base_name);
	child_fq    text;
	idx_name    text;
	i           int;
	partition_exists boolean;
BEGIN
	-- Check if partition already exists
	SELECT EXISTS(
		SELECT 1 FROM information_schema.tables 
		WHERE table_schema = p_schema AND table_name = base_name
	) INTO partition_exists;
	
	IF partition_exists THEN
		RAISE NOTICE 'Partition % already exists, skipping', base_name;
		RETURN;
	END IF;

	-- create the weekly partition
	EXECUTE format($SQL$ 
		CREATE TABLE %s
			PARTITION OF public.energy_data
			FOR VALUES FROM (%L) TO (%L)
			PARTITION BY HASH (sensor_id)
	$SQL$, parent_fq, start_date, end_date);

	-- create hash subpartitions and indexes
	FOR i IN 0..p_modulus-1 LOOP
		child_fq := format('%I.%I_%s', p_schema, base_name, i);
		EXECUTE format($SQL$
			CREATE TABLE IF NOT EXISTS %s
				PARTITION OF %s 
				FOR VALUES WITH (MODULUS %s, REMAINDER %s)
		$SQL$, child_fq, parent_fq, p_modulus, i);

		idx_name := format('%I_%s_%s_idx', base_name, 'time_sensor', i);
		EXECUTE format(
			'CREATE INDEX IF NOT EXISTS %I ON %s (timestamp, sensor_id)',
			idx_name, child_fq
		);
	END LOOP;

	RAISE NOTICE 'Created % weekly partition with % hash slices', base_name, p_modulus;
END;
$MAIN$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION sensor_partitions.backfill_weekly_partitions(
	p_start   date,
	p_end     date,
	p_modulus int    DEFAULT 16,
	p_schema  text   DEFAULT 'sensor_partitions'
)
RETURNS void
LANGUAGE plpgsql
AS $MAIN$
DECLARE
	dt date := date_trunc('week', p_start)::date;  -- Start from Monday of first week
	end_dt date := date_trunc('week', p_end)::date;  -- End at Monday of last week
BEGIN
	WHILE dt <= end_dt LOOP
		PERFORM sensor_partitions.create_weekly_partition(dt, p_modulus, p_schema);
		dt := dt + interval '7 days';  -- Move to next week
	END LOOP;
	RAISE NOTICE 'Backfilled weekly partitions from % to %', p_start, p_end;
END;
$MAIN$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION sensor_partitions.create_next_year_partitions(
	p_modulus int    DEFAULT 16,
	p_schema  text   DEFAULT 'sensor_partitions'
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
	ny        int;
	start_dt  date;
	end_dt    date;
BEGIN
	-- Compute next calendar year
	ny       := extract(year FROM current_date)::int + 1;
	start_dt := make_date(ny, 1, 1);
	end_dt   := make_date(ny, 12, 31);

	-- Bulk‐create all weekly partitions for next year
	PERFORM sensor_partitions.backfill_weekly_partitions(
		start_dt, end_dt, p_modulus, p_schema
	);

	RAISE NOTICE 'Backfilled partitions for year %', ny;
END;
$$;--> statement-breakpoint

-- Create partitions for last year and this year
DO $$
DECLARE
	current_year int := extract(year FROM current_date)::int;
	last_year int := current_year - 1;
BEGIN
	-- Create partitions for last year
	PERFORM sensor_partitions.backfill_weekly_partitions(
		make_date(last_year, 1, 1),
		make_date(last_year, 12, 31),
		16,
		'sensor_partitions'
	);
	
	-- Create partitions for this year
	PERFORM sensor_partitions.backfill_weekly_partitions(
		make_date(current_year, 1, 1),
		make_date(current_year, 12, 31),
		16,
		'sensor_partitions'
	);
	
	RAISE NOTICE 'Created weekly partitions for % and %', last_year, current_year;
END;
$$;--> statement-breakpoint

-- Insert all data from backup table into new partitioned table
DO $$
DECLARE
	row_count bigint;
BEGIN
	RAISE NOTICE 'Starting data migration from energy_data_backup to partitioned energy_data...';
	
	INSERT INTO energy_data 
	SELECT * FROM energy_data_backup;
	
	GET DIAGNOSTICS row_count = ROW_COUNT;
	RAISE NOTICE 'Successfully migrated % rows from backup table', row_count;
END;
$$;--> statement-breakpoint

-- Drop the backup table after successful migration
DROP TABLE energy_data_backup;--> statement-breakpoint

-- Schedule yearly partition creation job for December 30th at 23:00
SELECT cron.schedule(
	'energy_data_yearly_partition_job',
	'0 23 30 12 *',
	'SELECT sensor_partitions.create_next_year_partitions();'
);--> statement-breakpoint

DROP EXTENSION IF EXISTS timescaledb CASCADE;--> statement-breakpoint

-- Add time_bucket functions mimicking the timescaledb extension
CREATE OR REPLACE FUNCTION public.time_bucket(
  bucket INTERVAL,
  ts     TIMESTAMP WITHOUT TIME ZONE
)
RETURNS TIMESTAMP WITHOUT TIME ZONE
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT
    -- rebuild a timestamp from the floored epoch count
    TIMESTAMP 'epoch'
    + ( FLOOR(
          EXTRACT(EPOCH FROM ts)
          / EXTRACT(EPOCH FROM bucket)
        )::BIGINT
        * bucket
      );
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.time_bucket(
  bucket INTERVAL,
  ts     TIMESTAMP WITH TIME ZONE
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
IMMUTABLE
STRICT
AS $$
  SELECT
    TIMESTAMP WITH TIME ZONE 'epoch'
    + ( FLOOR(
          EXTRACT(EPOCH FROM ts)
          / EXTRACT(EPOCH FROM bucket)
        )::BIGINT
        * bucket
      );
$$;--> statement-breakpoint
