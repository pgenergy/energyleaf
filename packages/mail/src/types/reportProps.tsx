export interface DayStatistics {
    /**
     * base64 string
     */
    image: string;
    dayName: string;
    value: number;
    annotation: string;
}

export interface ReportProps {
    name: string;
    period: string;
    dayStatistics: DayStatistics[];
    totalEnergyConsumption: string;
    avgEnergyConsumptionPerDay: string;
    totalEnergyCost: string;
    avgEnergyCost: string;
    highestPeak: {
        dateTime: Date;
        deviceName: string;
        consumption: string;
    }

    /**
     * base64 image
     */
    consumptionGraph1: string;
    /**
     * base64 image
     */
    consumptionGraph2: string;
    /**
     * base64 image
     */
    consumptionGraph3: string;
}