-- Custom SQL migration file, put your code below! --
-- Fix send_process_request function:
-- 1. Cast row_to_json result to jsonb since net.http_post expects jsonb, not json
-- 2. Change request_id type from UUID to BIGINT since net.http_post returns bigint
-- 3. Remove net.await_result call which does not exist - pg_net is async and stores responses in net._http_response

CREATE OR REPLACE FUNCTION send_process_request(path TEXT, q_name TEXT)
RETURNS void AS $$
DECLARE
    queue_entry RECORD;
    request_id BIGINT;
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
        -- Send request asynchronously using http_post
        SELECT net.http_post(
            url := full_url,
            body := row_to_json(queue_entry)::jsonb,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || secret_key
            )
        ) INTO request_id;
    END LOOP;

END;
$$ LANGUAGE plpgsql;
