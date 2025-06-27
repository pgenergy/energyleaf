CREATE OR REPLACE VIEW "peak_suggestions_evaluation" AS (
    SELECT
        sensor_data_sequence.id,
        ARRAY(SELECT UNNEST(array_remove(array_agg(d.category), NULL)) INTERSECT SELECT UNNEST(array_remove(array_agg(device_category), NULL))) AS correct,
        ARRAY(SELECT UNNEST(array_remove(array_agg(device_category), NULL)) EXCEPT SELECT UNNEST(array_remove(array_agg(d.category), NULL))) AS wrong,
        ARRAY(SELECT UNNEST(array_remove(array_agg(d.category), NULL)) EXCEPT SELECT UNNEST(array_remove(array_agg(device_category), NULL))) AS missing
    FROM sensor_data_sequence
    LEFT JOIN public.device_suggestions_peak dsp on sensor_data_sequence.id = dsp.sensor_data_sequence_id
    INNER JOIN public.device_to_peak dtp on sensor_data_sequence.id = dtp.sensor_data_sequence_id
    LEFT JOIN public.device d on dtp.device_id = d.id
    GROUP BY sensor_data_sequence.id
);