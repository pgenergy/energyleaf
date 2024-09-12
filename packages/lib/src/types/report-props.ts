import { convertTZDate } from "../utils/util";

export interface DailyGoalProgress {
    day: Date;
    dailyConsumption: number;
    dailyGoal?: number;
    exceeded?: boolean;
    /**
     * The progress in percent. A value of 25 means 25%.
     */
    progress?: number;
}

export interface DailyGoalStatistic extends DailyGoalProgress {
    image: string;
}

export interface DailyConsumption {
    day: Date;
    consumption: number;
}

export interface LastReport {
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost?: number;
    avgEnergyCost?: number;
    bestDay: DailyConsumption;
    worstDay: DailyConsumption;
}

export interface ReportProps {
    userName?: string;
    dateFrom: Date;
    dateTo: Date;
    dayEnergyStatistics?: DailyGoalStatistic[];
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost?: number;
    avgEnergyCost?: number;
    bestDay: DailyConsumption;
    worstDay: DailyConsumption;

    /**
     * Image of the daily total consumption graph encoded as base64.
     */
    dailyTotalConsumptionGraph?: string;

    /**
     * The values of the last report to compare with the new report
     */
    lastReport?: LastReport;
}

export function reportPropsLocalTime(props: ReportProps) {
    return {
        ...props,
        dateFrom: convertTZDate(props.dateFrom, "client"),
        dateTo: convertTZDate(props.dateTo, "client"),
        dayEnergyStatistics: props.dayEnergyStatistics?.map((stat) => ({
            ...stat,
            day: convertTZDate(stat.day, "client"),
        })),
        bestDay: {
            ...props.bestDay,
            day: convertTZDate(props.bestDay.day, "client"),
        },
        worstDay: {
            ...props.worstDay,
            day: convertTZDate(props.worstDay.day, "client"),
        },
    };
}
