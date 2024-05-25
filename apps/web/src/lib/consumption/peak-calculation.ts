import { differenceInMinutes } from "date-fns";

import type { ConsumptionData } from "@energyleaf/lib";

const peakWindowWidthInMinutes = 60;

export default function calculatePeaks(data: ConsumptionData[]): Promise<ConsumptionData[]> {
    const dataAboveThreshold = getDataAboveThreshold(data);
    const peakWindows = splitIntoWindows(dataAboveThreshold);
    return peakWindows.map(getPeakWithMaxEnergyInWindow);
}

function splitIntoWindows(data: ConsumptionData[]): ConsumptionData[][] {
    const now = new Date();
    return data
        .reduce<ConsumptionData[][]>((acc, curr) => {
            if (acc.length === 0) {
                acc.push([curr]);
                return acc;
            }
            const currentGroup = acc[acc.length - 1];
            if (
                differenceInMinutes(new Date(curr.timestamp), new Date(currentGroup[0].timestamp)) >=
                peakWindowWidthInMinutes
            ) {
                acc.push([curr]);
            } else {
                currentGroup.push(curr);
            }
            return acc;
        }, [])
        .filter((x) => x.length > 0 && differenceInMinutes(now, new Date(x[0].timestamp)) >= peakWindowWidthInMinutes); // Consolidated filtering logic to ensure groups are older than 60 minutes and not empty
}

function calculatePeakThreshold(data: ConsumptionData[]): number {
    const mean = data.reduce((acc, cur) => acc + cur.energy, 0) / data.length;
    const std = Math.sqrt(data.map((x) => (x.energy - mean) ** 2).reduce((acc, cur) => acc + cur, 0) / data.length);
    return mean + 2 * std;
}

function getDataAboveThreshold(data: ConsumptionData[]): ConsumptionData[] {
    const threshold = calculatePeakThreshold(data);
    return data.filter((x) => x.energy > threshold);
}

function getPeakWithMaxEnergyInWindow(window: ConsumptionData[]): ConsumptionData {
    return window.reduce((prev, current) => (prev.energy >= current.energy ? prev : current));
}
