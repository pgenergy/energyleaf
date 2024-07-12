import { createHash } from "node:crypto";
import { updateDevicesForPeak } from "@/actions/peak";
import DashboardDateRange from "@/components/dashboard/dashboard-date-range";
import { env } from "@/env.mjs";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor, getSensorDataSequences } from "@/query/energy";
import type { ConsumptionData } from "@energyleaf/lib";
import { AggregationType } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Button } from "@energyleaf/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import CSVExportButton from "./csv-export-button";
import DashboardZoomReset from "./dashboard-zoom-reset";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import PeakButton from "./peaks/peak-button";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregationType: string | undefined;
}

export default async function EnergyConsumptionCard({ startDate, endDate, aggregationType }: Props) {
    const { user } = await getSession();

    if (!user) {
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
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
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
        sensorDataId: entry.id,
        isPeak: false, // TODO: remove.
        isAnomaly: false, // TODO: remove.
    }));

    const betterPeaks = await getSensorDataSequences(sensorId);
    console.log(betterPeaks);

    const peaks =
        !hasAggregation && fulfills(user.appVersion, Versions.self_reflection)
            ? data.filter((d) => d.isPeak || d.isAnomaly)
            : [];

    const csvExportData = {
        userId: user.id,
        userHash: createHash("sha256").update(`${user.id}${env.HASH_SECRET}`).digest("hex"),
        endpoint:
            env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview"
                ? `https://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/csv_energy`
                : `http://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/csv_energy`,
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start">
                <div className="flex flex-row justify-between gap-2">
                    <div>
                        {betterPeaks.map((peak) => (
                            <PeakButton key={peak.id} peakId={peak.id} end={peak.end} start={peak.start} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <CardTitle>Verbrauch</CardTitle>
                        <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum.</CardDescription>
                    </div>
                    {user.id !== "demo" ? (
                        <CSVExportButton
                            userId={csvExportData.userId}
                            userHash={csvExportData.userHash}
                            endpoint={csvExportData.endpoint}
                        />
                    ) : null}
                </div>
                <div className="flex flex-row gap-4">
                    <DashboardZoomReset />
                    {user.id !== "demo" ? (
                        <>
                            <DashboardDateRange endDate={endDate} startDate={startDate} />
                            <DashboardEnergyAggregation selected={aggregation} />
                        </>
                    ) : null}
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
                            peaks={hasAggregation ? undefined : peaks}
                            aggregation={aggregation}
                            userId={userId}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
