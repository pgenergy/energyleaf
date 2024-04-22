import { AggregationType } from "../types/types";

export const computeTimestampLabel = (aggregationParam: AggregationType | undefined, withWh: boolean) => {
    switch (aggregationParam) {
        case AggregationType.YEAR:
            return withWh ? "kWh / Jahr" : "(in Jahren)";
        case AggregationType.MONTH:
            return withWh ? "kWh / Monat" : "(in Monaten)";
        case AggregationType.WEEK:
            return withWh ? "kWh / Wochen" : "(in Wochen)";
        case AggregationType.DAY:
            return withWh ? "kWh / Tag" : "(in Tagen)";
        case AggregationType.HOUR:
            return withWh ? "kWh / Stunde" : "(in Stunden)";
        default:
            return withWh ? "kWh (Einheit nicht spezifiziert)" : "(Einheit nicht spezifiziert)";
    }
};
