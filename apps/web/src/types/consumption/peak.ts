export interface PeakAssignment {
    sensorId: string | number;
    devices: number[] | undefined;
    timestamp: string;
}

export interface Peak extends PeakAssignment {
    energy: number;
}
