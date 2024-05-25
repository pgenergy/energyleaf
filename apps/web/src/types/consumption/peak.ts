export interface PeakAssignment {
    sensorId: string | number;
    devices: number[] | undefined;
    timestamp: string;
    sensorDataId: string;
}

export interface Peak extends PeakAssignment {
    energy: number;
}
