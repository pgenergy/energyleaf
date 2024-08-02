import { AggregationType } from "./types";

export const aggregationLabels = {
    [AggregationType.RAW]: "Nicht aggregiert",
    [AggregationType.HOUR]: "Stunde",
    [AggregationType.DAY]: "Tag",
    [AggregationType.WEEKDAY]: "Wochentag",
    [AggregationType.WEEK]: "Woche",
    [AggregationType.CALENDAR_WEEK]: "Kalenderwoche",
    [AggregationType.MONTH]: "Monat",
    [AggregationType.YEAR]: "Jahr",
};
