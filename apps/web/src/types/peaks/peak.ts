export interface PeakAssignment {
    sensorId: string;
    device: number | undefined;
    timestamp: string;
}

export interface Peak extends PeakAssignment {
    energy: number;
}