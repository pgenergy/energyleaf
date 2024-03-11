export interface PeakAssignment {
    sensorId: string | number;
    device: number | undefined;
    timestamp: string;
}

export interface Peak extends PeakAssignment {
    energy: number;
}
