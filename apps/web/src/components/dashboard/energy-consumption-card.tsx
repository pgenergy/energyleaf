import { redirect } from "next/navigation";
import { getAggregatedEnergy } from "@/lib/aggregate-energy";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForSensor, getElectricitySensorIdForUser, getPeaksForUser } from "@/query/energy";
import { differenceInMinutes } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardDateRange from "./date-range";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import { getDevicesByUser } from "@/query/device";
import RawEnergyConsumptionCardChart from "./peaks/raw-energy-consumption-card-chart";
import { AggregationType } from "@/types/aggregation/aggregation-type";
import type { PeakAssignment } from "@/types/peaks/peak";

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
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        throw new Error("Kein Stromsensor für diesen Benutzer gefunden");
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const data = energyData.map((entry) => ({
        id: entry.id,
        energy: entry.value,
        timestamp: entry.timestamp.toString(),
    }));
    
    const realAggregationType = aggregationType || AggregationType.RAW;
    const aggregatedDataInput = getAggregatedEnergy(data, realAggregationType);
    const aggregatedData = aggregatedDataInput.map((entry) => ({
        energy: entry.energy,
        timestamp: entry.timestamp.toString(),
    }));

    const noAggregation = realAggregationType === AggregationType.RAW;

    let peakAssignments: PeakAssignment[] = [];
    const devices = noAggregation ? await getDevicesByUser(userId) : [];
    
    if (noAggregation) {
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
        peakAssignments = peaks.map(x => ({
            id: x.id,
            device: peaksWithDevicesAssigned.find((p) => p.id === x.id)?.device
        }));
    }

    function Chart() {
        return (
            noAggregation ?
            <RawEnergyConsumptionCardChart data={data} devices={devices} peaks={peakAssignments}  /> :
            <EnergyConsumptionCardChart data={aggregatedData} />
        )
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht deines Verbrauchs im Zeitraum</CardDescription>
                </div>
                <div className="flex flex-row gap-4">
                    <DashboardDateRange endDate={endDate} startDate={startDate} />
                    <DashboardEnergyAggregation endDate={endDate} startDate={startDate} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                        </div>
                    ) : (
                        <Chart />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
