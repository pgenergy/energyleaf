import type {PeakAssignment} from "@/types/consumption/peak";
import type ConsumptionData from "@/types/consumption/consumption-data";
import {differenceInMinutes} from "date-fns";
import {getPeaksBySensor} from "@/query/energy";

const peakWindowWidthInMinutes = 60;

export default async function calculatePeaks(data: ConsumptionData[],
                                             startDate: Date,
                                             endDate: Date,
                                             sensorId: string): Promise<PeakAssignment[]> {
    const peaks = getPeaks(data);
    const peaksWithDevicesAssigned = await getPeaksWithDevicesAssigned(startDate, endDate, sensorId);

    return peaks.map((x) => ({
        sensorId: x.sensorId,
        device: peaksWithDevicesAssigned.find((p) => p && p.id === x.sensorId)?.device,
        timestamp: x.timestamp,
    }));
}

function getPeaks(data: ConsumptionData[]) {
    const dataAboveThreshold = getDataAboveThreshold(data);
    const peakWindows = splitIntoWindows(dataAboveThreshold);
    return peakWindows.map(getPeakWithMaxEnergyInWindow);
}

function splitIntoWindows(data: ConsumptionData[]): ConsumptionData[][] {
    const now = new Date();
    return data.reduce<ConsumptionData[][]>(
        (acc, curr) => {
            const currentGroup = acc[acc.length - 1];

            if (differenceInMinutes(new Date(curr.timestamp), new Date(currentGroup[0].timestamp)) >= peakWindowWidthInMinutes) {
                acc.push([curr]);
            } else {
                currentGroup.push(curr);
            }

            return acc;
        },
        []
    ).filter((x) => differenceInMinutes(now, new Date(x[0].timestamp)) >= peakWindowWidthInMinutes); // ignore groups that are less than 60 minutes old as they are not complete
}

function calculatePeakThreshold(data: ConsumptionData[]): number {
    const mean = data.reduce((acc, cur) => acc + cur.energy, 0) / data.length;
    const std = Math.sqrt(
        data.map((x) => Math.pow(x.energy - mean, 2)).reduce((acc, cur) => acc + cur, 0) / data.length,
    );
    return mean + 2 * std;
}

function getDataAboveThreshold(data: ConsumptionData[]): ConsumptionData[] {
    const threshold = calculatePeakThreshold(data);
    return data.filter((x) => x.energy > threshold);
}

function getPeakWithMaxEnergyInWindow(window: ConsumptionData[]): ConsumptionData {
    return window.reduce((prev, current) => (prev.energy >= current.energy) ? prev : current);
}

async function getPeaksWithDevicesAssigned(startDate: Date, endDate: Date, sensorId: string) {
    return (await getPeaksBySensor(startDate, endDate, sensorId))
        .map((x) => {
            if (x.sensor_data !== null) {
                return {
                    id: x.sensor_data.sensorId,
                    device: x.peaks.deviceId,
                };
            }

            return null;
        })
        .filter(Boolean)
}