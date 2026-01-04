-- Custom SQL migration file, put your code below! --
-- Fix send_check_request function:
-- 1. Remove invalid 'body' parameter from net.http_get (GET requests don't have bodies)
-- 2. Fix undefined 'request_id' variable in error logging

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
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || secret_key
        )
    );

    -- Log or handle errors
    IF (response->>'status')::int != 200 THEN
        RAISE NOTICE 'Failed request: %, Response: %', full_url, response;
    END IF;
END;
$$ LANGUAGE plpgsql;
