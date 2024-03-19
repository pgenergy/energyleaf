import {AggregationType} from "../types/types";

export const computeTimestampLabel = (aggregationParam: AggregationType | undefined, withWh: boolean) => {
    switch (aggregationParam) {
        case AggregationType.YEAR: return withWh ? 'Wh / Jahr' : '(in Jahren)';
        case AggregationType.MONTH: return withWh ? 'Wh / Monat' : '(in Monaten)';
        case AggregationType.WEEK: return withWh ? 'Wh / Wochen' : '(in Wochen)';
        case AggregationType.DAY: return withWh ? 'Wh / Tag' : '(in Tagen)';
        case AggregationType.HOUR: return withWh ? 'Wh / Stunde' : '(in Stunden)';
        default: return withWh ? 'Wh (Einheit nicht spezifiziert)' : '(Einheit nicht spezifiziert)';
    }
};