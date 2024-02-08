import type { PeakAssignment } from "@/types/peaks/peak";
import { differenceInMinutes } from "date-fns";

import { AggregationType } from "@energyleaf/db/util";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardDateRange from "./date-range";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";

interface Props {
    startDate: Date;
    endDate: Date;
    sensorId: string | null;
    energyData: {
        id: number;
        timestamp: Date | null;
        value: number;
        sensorId: string | null;
    }[];
    aggregation: AggregationType;
    devices: {
        id: number;
        userId: number;
        name: string;
        created: Date | null;
        timestamp: Date;
    }[];
    peaksWithDevicesAssigned: ({
        id: string;
        device: number;
    } | null)[];
}

export default function EnergyConsumptionCard({
    startDate,
    endDate,
    sensorId,
    energyData,
    aggregation,
    devices,
    peaksWithDevicesAssigned,
}: Props) {
    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Dein Sensor konnte nicht gefunden werden</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const hasAggregation = aggregation !== AggregationType.RAW;
    const data = energyData.map((entry) => ({
        sensorId: entry.sensorId ?? "",
        energy: entry.value,
        timestamp: entry.timestamp ? entry.timestamp.toString() : "",
    }));

    let peakAssignments: PeakAssignment[] = [];

    if (!hasAggregation) {
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

        peakAssignments = peaks.map((x) => ({
            sensorId: x.sensorId,
            device: peaksWithDevicesAssigned.find((p) => p && p.id === x.sensorId)?.device,
            timestamp: x.timestamp,
        }));
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start md:flex-row md:justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht deines Verbrauchs im Zeitraum</CardDescription>
                </div>
                <div className="flex flex-row gap-4">
                    <DashboardDateRange endDate={endDate} startDate={startDate} />
                    <DashboardEnergyAggregation selected={aggregation} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                        </div>
                    ) : (
                        <EnergyConsumptionCardChart
                            data={data}
                            devices={devices}
                            peaks={hasAggregation ? undefined : peakAssignments}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
