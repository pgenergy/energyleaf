export interface PeakAssignment {
    sensorId: number;
    device: number | undefined;
    timestamp: string;
}

export interface Peak extends PeakAssignment {
    energy: number;
}
