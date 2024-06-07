import { AggregationType } from "../types/types";

export const computeTimestampLabel = (aggregationParam: AggregationType | undefined, withWh: boolean) => {
    switch (aggregationParam) {
        case AggregationType.YEAR:
            return withWh ? "kWh (Jahr)" : "(in Jahren)";
        case AggregationType.MONTH:
            return withWh ? "kWh (Monat)" : "(in Monaten)";
        case AggregationType.WEEK:
            return withWh ? "kWh (Wochen)" : "(in Wochen)";
        case AggregationType.DAY:
            return withWh ? "kWh (Tag)" : "(in Tagen)";
        case AggregationType.HOUR:
            return withWh ? "kWh (Stunde)" : "(in Stunden)";
        default:
            return withWh ? "kWh" : "";
    }
};

/**
 * Correctly formats a date to "dd.MM.yyyy". </br>
 * Unfortunately, the native date.toLocaleDateString() method does not work as expected because it does not add the leading zeros to the day and month.
 *
 * @param date The date to be formatted
 * @returns the formatted date in the format "dd.MM.yyyy"
 */
export function formatDate(date: Date): string {
    return `${`0${date.getDate()}`.slice(-2)}.${`0${date.getMonth() + 1}`.slice(-2)}.${date.getFullYear()}`;
}
