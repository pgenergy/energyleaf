import { getTimezoneOffset } from "date-fns-tz";
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
    if (!date) {
        return "";
    }

    return `${`0${date.getDate()}`.slice(-2)}.${`0${date.getMonth() + 1}`.slice(-2)}.${date.getFullYear()}`;
}

export const formatNumber = (number: number) =>
    number.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function getDayOfWeek(date: Date): string {
    const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    return days[date.getDay()];
}

/**
 * Convert a server date to berlin timezone before send to client
 */
export function convertTZDate(date: Date, type: "server" | "client" = "server") {
    const offset = getTimezoneOffset("Europe/Berlin", new Date());
    const localOffset = Math.abs(new Date().getTimezoneOffset() * 60 * 1000);

    if (type === "server") {
        return offset === localOffset ? date : new Date(date.getTime() - offset);
    }

    return offset === localOffset ? date : new Date(date.getTime() + offset);
}
