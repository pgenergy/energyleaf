import { AggregationType } from "./types";

export const aggregationLabels = {
    [AggregationType.RAW]: "Nicht aggregiert",
    [AggregationType.HOUR]: "Stunde",
    [AggregationType.DAY]: "Tag",
    [AggregationType.WEEK]: "Woche",
    [AggregationType.MONTH]: "Monat",
    [AggregationType.YEAR]: "Jahr",
};
