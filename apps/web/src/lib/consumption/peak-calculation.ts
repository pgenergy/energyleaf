import { getPeaksBySensor } from "@/query/energy";
import type ConsumptionData from "@/types/consumption/consumption-data";
import type { PeakAssignment } from "@/types/consumption/peak";
import { differenceInMinutes } from "date-fns";

const peakWindowWidthInMinutes = 60;

export default async function calculatePeaks(
    data: ConsumptionData[],
    startDate: Date,
    endDate: Date,
    sensorId: string,
): Promise<PeakAssignment[]> {
    const peaks = getPeaks(data);
    const peaksWithDevicesAssigned = await getPeaksWithDevicesAssigned(startDate, endDate, sensorId);

    return peaks.map((x) => ({
        sensorId: x.sensorId,
        device: peaksWithDevicesAssigned.find(
            (p) => p && p.id === x.sensorId && p.timestamp?.getTime() === new Date(x.timestamp).getTime(),
        )?.device,
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

async function getPeaksWithDevicesAssigned(startDate: Date, endDate: Date, sensorId: string) {
    return (await getPeaksBySensor(startDate, endDate, sensorId))
        .map((x) => {
            if (x.sensor_data !== null) {
                return {
                    id: x.sensor_data.sensorId,
                    device: x.peaks.deviceId,
                    timestamp: x.peaks.timestamp,
                };
            }
            return null;
        })
        .filter(Boolean);
}
