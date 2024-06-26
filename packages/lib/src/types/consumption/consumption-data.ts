export interface ConsumptionData {
    sensorId: string | number;
    energy: number;
    timestamp: string;
    sensorDataId: string;
    isPeak?: boolean;
    isAnomaly?: boolean;
}
