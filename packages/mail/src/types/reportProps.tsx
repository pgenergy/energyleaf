export interface DayStatistics {
    day: Date,
    dailyConsumption: number,
    dailyGoal?: number,
    exceeded?: boolean,
    progress?: number
}

export interface ReportProps {
    name: string;
    dateFrom: Date;
    dateTo: Date;
    dayEnergyStatistics: DayStatistics[];
    totalEnergyConsumption: number;
    avgEnergyConsumptionPerDay: number;
    totalEnergyCost: number;
    avgEnergyCost: number;
    highestPeak: {
        dateTime: Date;
        deviceName: string;
        consumption: string;
    }

    /**
     * base64 image
     */
    consumptionGraph?: string;
    /**
     * base64 image
     */
    consumptionGraph2?: string;
    /**
     * base64 image
     */
    consumptionGraph3?: string;
}