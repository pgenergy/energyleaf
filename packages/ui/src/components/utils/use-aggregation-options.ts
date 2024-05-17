import { differenceInCalendarDays, differenceInMonths, differenceInWeeks, differenceInYears } from "date-fns";
import { AggregationType } from "@energyleaf/lib";

export function calculateAggregationOptions(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) {
        return [AggregationType.RAW];
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const dayDiff = differenceInCalendarDays(endDate, startDate);
    const monthDiff = differenceInMonths(endDate, startDate);
    const weekDiff = differenceInWeeks(endDate, startDate);
    const yearDiff = differenceInYears(endDate, startDate);

    const options = [AggregationType.RAW];

    if (dayDiff >= 1) options.push(AggregationType.HOUR);
    if (dayDiff >= 2) options.push(AggregationType.DAY);
    if (weekDiff >= 2) options.push(AggregationType.WEEK);
    if (monthDiff >= 2) options.push(AggregationType.MONTH);
    if (yearDiff >= 2) options.push(AggregationType.YEAR);

    return options;
}
