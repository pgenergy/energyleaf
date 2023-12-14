interface PeakAssignment {
    id: number;
    device?: number | undefined;
}

interface Peak extends PeakAssignment {
    timestamp: string;
    energy: number;
}