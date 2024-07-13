export interface ConsumptionData {
    sensorId: string | number;
    energy: number;
    timestamp: string;
    sensorDataId: string;
}

export interface Peak {
    id: string;
    averagePeakPower: number;
    start: Date;
    end: Date;
}
