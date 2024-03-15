import {AggregationType} from "@energyleaf/db/util";

/**
 * Erzeugt Zusatztext bezüglich der ausgewählten Einheit
 *
 * @param aggregationParam  Ausgewählter Aggregationswert
 * @param withWh            Mit "Wh" Label dazu
 */
export const computeTimestampLabel = (aggregationParam, withWh) => {
    switch (aggregationParam) {
        case AggregationType.YEAR: return withWh ? 'Wh / Jahr' : '(in Jahren)';
        case AggregationType.MONTH: return withWh ? 'Wh / Monat' : '(in Monaten)';
        case AggregationType.WEEK: return withWh ? 'Wh / Wochen' : '(in Wochen)';
        case AggregationType.DAY: return withWh ? 'Wh / Tag' : '(in Tagen)';
        case AggregationType.HOUR: return withWh ? 'Wh / Stunde' : '(in Stunden)';
        default: return withWh ? 'Wh (Einheit nicht spezifiziert)' : '(Einheit nicht spezifiziert)';
    }
};