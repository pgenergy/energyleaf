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

export interface ReportProps {
    userName?: string;
    dateFrom: Date;
    dateTo: Date;
    dayEnergyStatistics?: DailyGoalStatistic[];
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost: number;
    avgEnergyCost: number;
    bestDay: DailyConsumption;
    worstDay: DailyConsumption;

    /**
     * base64 image
     */
    consumptionGraph1?: string;
    /**
     * base64 image
     */
    consumptionGraph2?: string;
    /**
     * base64 image
     */
    consumptionGraph3?: string;

    /**
     * The values of the last report to compare with the new report
     */
    lastReport?: ReportProps;
}
