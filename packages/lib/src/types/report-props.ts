export interface DayStatistics {
    // formatted Date string
    day: string;
    dailyConsumption: number;
    dailyGoal?: number;
    exceeded?: boolean;
    progress?: number;
}

export interface ReportProps {
    userName?: string;
    // formatted Date string
    dateFrom: string;
    // formatted Date string
    dateTo: string;
    dayEnergyStatistics: DayStatistics[];
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost: number;
    avgEnergyCost: number;
    highestPeak: {
        // formatted Date string
        dateTime: string;
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
}
