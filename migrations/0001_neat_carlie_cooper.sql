-- Custom SQL migration file, put you code below! --
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
