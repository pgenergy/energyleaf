interface DayStatistics {
    // formatted date string
    day: string;
    dailyConsumption: number;
    dailyGoal?: number;
    exceeded?: boolean;
    progress?: number;
}

interface ReportProps {
    name?: string;
    // formatted date string
    dateFrom: string;
    // formatted date string
    dateTo: string;
    dayEnergyStatistics: DayStatistics[];
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost: number;
    avgEnergyCost: number;
    highestPeak: {
        dateTime: Date;
        deviceName: string;
        consumption: string;
    };

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

    unsubscribeLink: string;
}

export type { ReportProps, DayStatistics };
