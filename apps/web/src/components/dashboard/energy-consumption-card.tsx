import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser } from "@/query/device";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import type { PeakAssignment } from "@/types/consumption/peak";

import { AggregationType } from "@energyleaf/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardDateRange from "./date-range";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import type ConsumptionData from "@/types/consumption/consumption-data";
import calculatePeaks from "@/lib/consumption/peak-calculation";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregationType: string | undefined;
}

export default async function EnergyConsumptionCard({ startDate, endDate, aggregationType }: Props) {
    const { session, user } = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    let aggregation = AggregationType.RAW;
    if (aggregationType) {
        aggregation = AggregationType[aggregationType.toUpperCase() as keyof typeof AggregationType];
    }
    const hasAggregation = aggregation !== AggregationType.RAW;
    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId, aggregation);
    const data: ConsumptionData[] = energyData.map((entry) => ({
        sensorId: entry.sensorId || 0,
        energy: entry.value,
        timestamp: entry.timestamp.toString(),
    }));

    const devices = !hasAggregation ? await getDevicesByUser(userId) : [];
    const peakAssignments: PeakAssignment[] = !hasAggregation
        ? await calculatePeaks(data, startDate, endDate, sensorId)
        : [];

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start md:flex-row md:justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum.</CardDescription>
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
