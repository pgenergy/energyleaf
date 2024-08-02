import { AggregationType } from "@energyleaf/lib";
import {
    differenceInCalendarDays,
    differenceInHours,
    differenceInMonths,
    differenceInWeeks,
    differenceInYears,
} from "date-fns";

type DateType = Date | string | null;

export function calculateAggregationOptions(startDateStr: DateType, endDateStr: DateType) {
    if (!startDateStr || !endDateStr) {
        return [AggregationType.RAW];
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const hourDiff = differenceInHours(endDate, startDate);
    const dayDiff = differenceInCalendarDays(endDate, startDate);
    const monthDiff = differenceInMonths(endDate, startDate);
    const weekDiff = differenceInWeeks(endDate, startDate);
    const yearDiff = differenceInYears(endDate, startDate);

    const options = [AggregationType.RAW];

    if (hourDiff >= 1) options.push(AggregationType.HOUR);
    if (dayDiff >= 2) options.push(AggregationType.DAY);
    if (dayDiff >= 2) options.push(AggregationType.WEEKDAY);
    if (weekDiff >= 2) options.push(AggregationType.WEEK);
    if (weekDiff >= 2) options.push(AggregationType.CALENDAR_WEEK);
    if (monthDiff >= 2) options.push(AggregationType.MONTH);
    if (yearDiff >= 2) options.push(AggregationType.YEAR);

    return options;
}
