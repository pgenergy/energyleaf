import { redirect } from "next/navigation";
import { getAggregatedEnergy } from "@/lib/aggregate-energy";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForUser, getPeaksForUser } from "@/query/energy";
import { differenceInMinutes } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardDateRange from "./date-range";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import { getDevicesByUser } from "@/query/device";
import { get } from "http";
import RawEnergyConsumptionCardChart from "./peaks/raw-energy-consumption-card-chart";
import { AggregationType } from "@/types/aggregation/aggregation-type";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregationType: string | undefined;
}

export default async function EnergyConsumptionCard({ startDate, endDate, aggregationType }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;

    const energyData = await getEnergyDataForUser(startDate, endDate, userId);
    const data = energyData.map((entry) => ({
        id: entry.id,
        energy: entry.value,
        timestamp: entry.timestamp.toString(),
    }));
    
    aggregationType = aggregationType || AggregationType.RAW;
    const aggregatedDataInput = getAggregatedEnergy(data, aggregationType);
    const aggregatedData = aggregatedDataInput.map((entry) => ({
        energy: entry.energy,
        timestamp: entry.timestamp.toString(),
    }));

    var noAggregation = aggregationType === AggregationType.RAW;

    var enrichedPeaks: {
        id: number;
        device?: number | undefined;
        energy: number;
        timestamp: string;
    }[] = [];
    const devices = noAggregation ? await getDevicesByUser(userId) : [];
    
    const showPeaks = noAggregation && devices.length > 0;
    if (showPeaks) {
        const mean = data.reduce((acc, cur) => acc + cur.energy, 0) / data.length;
        const std = Math.sqrt(
            data.map((x) => Math.pow(x.energy - mean, 2)).reduce((acc, cur) => acc + cur, 0) / data.length,
        );
        const threshold = mean + 2 * std;
        const peaks = data
            .filter((x) => x.energy > threshold)
            .filter((x, i, arr) => {
                if (i === 0) {
                    return true;
                }

                return differenceInMinutes(new Date(x.timestamp), new Date(arr[i - 1].timestamp)) > 60;
            });

        const peaksWithDevicesAssigned = (await getPeaksForUser(startDate, endDate, userId))
            .map(x => ({
                id: x.sensor_data.id,
                device: x.peaks.deviceId
            }));
        enrichedPeaks = peaks.map(x => ({
            ...x,
            ...(peaksWithDevicesAssigned.find((p) => p.id === x.id) || {}),
        }));
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht deines Verbrauchs im Zeitraum</CardDescription>
                </div>
                <DashboardDateRange endDate={endDate} startDate={startDate} />
                <DashboardEnergyAggregation endDate={endDate} startDate={startDate} />
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                        </div>
                    ) : (
                        showPeaks ?
                        <RawEnergyConsumptionCardChart data={data} peaks={enrichedPeaks} devices={devices} /> :
                        <EnergyConsumptionCardChart data={aggregatedData} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
