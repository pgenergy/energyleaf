import _ from "lodash";

import type { ConsumptionData } from "@energyleaf/lib";

function calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) {
        return 0;
    }

    const meanValue = _.mean(values);
    const squaredDifferences = values.map((val) => Math.pow(val - meanValue, 2));
    const sumSquaredDiff = _.sum(squaredDifferences);
    const variance = sumSquaredDiff / (values.length - 1);

    return Math.sqrt(variance);
}

function findNoticeableEntry(data: ConsumptionData[], avg: number, threshold: number): ConsumptionData | null {
    for (const entry of data) {
        const difference = Math.abs(entry.energy - avg);

        if (difference > threshold) {
            return entry;
        }
    }
    return null;
}

export function isNoticeableEnergyConsumption(data: ConsumptionData[]): boolean {
    if (data.length < 2) {
        return false;
    }

    const values = data.map((entry: ConsumptionData) => entry.energy);

    const avg = _.mean(values);
    const stdDev = calculateStandardDeviation(values);

    const threshold = 2 * stdDev;

    const noticeableEntry = findNoticeableEntry(data, avg, threshold);

    return Boolean(noticeableEntry);
}
