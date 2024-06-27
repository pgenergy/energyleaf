export interface DeviceClassification {
    timestamp: string;
    power: number;
    dominantClassification: string;
    classification: Record<string, number>;
}
