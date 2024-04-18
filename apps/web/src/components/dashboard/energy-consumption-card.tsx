import { redirect } from "next/navigation";
import DashboardDateRange from "@/components/dashboard/dashboard-date-range";
import { getSession } from "@/lib/auth/auth.server";
import calculatePeaks from "@/lib/consumption/peak-calculation";
import { getDevicesByUser } from "@/query/device";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import type ConsumptionData from "@/types/consumption/consumption-data";
import type { PeakAssignment } from "@/types/consumption/peak";

import {AggregationType} from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardZoomReset from "./dashboard-zoom-reset";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import {fulfills, Versions} from "@energyleaf/lib/versioning";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregationType: string | undefined;
}

export default async function EnergyConsumptionCard({ startDate, endDate, aggregationType }: Props) {
    const { session, user } = await getSession();

    if (!session || !user) {
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
    const peakAssignments: PeakAssignment[] = !hasAggregation && fulfills(user.appVersion, Versions.self_reflection)
        ? await calculatePeaks(data, startDate, endDate, sensorId)
        : [];

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum.</CardDescription>
                </div>
                <div className="flex flex-row gap-4">
                    <DashboardZoomReset />
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
                            aggregation={aggregation}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
