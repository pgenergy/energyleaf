export interface PeakAssignment {
    id: number;
    device: number | undefined;
}

export interface Peak extends PeakAssignment {
    timestamp: string;
    energy: number;
}
