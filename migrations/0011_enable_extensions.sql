-- -- Custom SQL migration file, put your code below! --
CREATE SCHEMA IF NOT EXISTS extensions;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;--> statement-breakpoint
grant usage on schema cron to postgres;--> statement-breakpoint
grant all privileges on all tables in schema cron to postgres;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pgmq;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT
);--> statement-breakpoint

SELECT pgmq.create('peaks_queue');
SELECT pgmq.create('reports_queue');
SELECT pgmq.create('anomalies_queue');

CREATE OR REPLACE FUNCTION send_check_request(path TEXT)
RETURNS void AS $$
DECLARE
    backend_url TEXT;
    full_url TEXT;
    response jsonb;
    secret_key TEXT;
BEGIN
    -- Fetch the URL from the configuration table
    SELECT value INTO backend_url FROM public.app_config WHERE key = 'base_url';
    SELECT value INTO secret_key FROM public.app_config WHERE key = 'secret_key';

    -- Check if value exists if not return early 
    IF backend_url IS NULL OR secret_key IS NULL THEN
        RAISE NOTICE 'Base URL not found in app_config. Exiting function.';
        RETURN;
    END IF;

    full_url := backend_url || path;

    -- Send HTTP request using the fetched URL
    SELECT * INTO response FROM net.http_get(
        url := full_url,
        body := '{"status":"ok"}',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || secret_key
        )
    );

    -- Log or handle errors
    IF (response->>'status')::int != 200 THEN
        RAISE NOTICE 'Failed request: %, Response: %', request_id, response;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'check_peaks_cron',
    '0,30 * * * *',
    $$SELECT send_check_request('/peaks');$$
);

SELECT cron.schedule(
    'check_reports_cron',
    '0 * * * *',
    $$SELECT send_check_request('/reports');$$
);

SELECT cron.schedule(
    'check_anomalies_cron',
    '0,30 * * * *',
    $$SELECT send_check_request('/anomalies');$$
);

CREATE OR REPLACE FUNCTION send_process_request(path TEXT, q_name TEXT)
RETURNS void AS $$
DECLARE
    queue_entry RECORD;
    request_ids UUID[] := ARRAY[]::UUID[];
    response jsonb;
    request_id UUID;
    backend_url TEXT;
    secret_key TEXT;
    full_url TEXT;
BEGIN
    -- Fetch the URL from the configuration table
    SELECT value INTO backend_url FROM public.app_config WHERE key = 'base_url';
    SELECT value INTO secret_key FROM public.app_config WHERE key = 'secret_key';

    -- Check if value exists if not return early 
    IF backend_url IS NULL OR secret_key IS NULL THEN
        RAISE NOTICE 'Base URL not found in app_config. Exiting function.';
        RETURN;
    END IF;

    full_url := backend_url || path;

    -- Send asynchronous HTTP requests
    FOR queue_entry IN
        SELECT * FROM pgmq.read(
            queue_name => q_name,
            vt => 300,
            qty => 50
        )
    LOOP
        -- Send request in parallel using http_send
        SELECT net.http_post(
            url := full_url,
            body := row_to_json(queue_entry),
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || secret_key
            )
        ) INTO request_id;

        -- Collect request IDs
        request_ids := array_append(request_ids, request_id);
    END LOOP;

    -- Wait for all responses in parallel
    FOR request_id IN SELECT unnest(request_ids)
    LOOP
        SELECT * INTO response
        FROM net.await_result(request_id, 60);  -- 60-second timeout

        -- Log or handle errors
        IF (response->>'status')::int != 200 THEN
            RAISE NOTICE 'Failed request: %, Response: %', request_id, response;
        END IF;
    END LOOP;

END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule(
    'process_peaks_cron',
    '*/5 * * * *',
    $$SELECT send_process_request('/peaks', 'peaks_queue');$$
);

SELECT cron.schedule(
    'process_reports_cron',
    '*/5 * * * *',
    $$SELECT send_process_request('/reports', 'reports_queue');$$
);

SELECT cron.schedule(
    'process_anomalies_cron',
    '*/5 * * * *',
    $$SELECT send_process_request('/anomalies', 'anomalies_queue');$$
);
