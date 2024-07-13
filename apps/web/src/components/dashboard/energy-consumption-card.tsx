import { createHash } from "node:crypto";
import { env } from "@/env.mjs";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor, getSensorDataSequences } from "@/query/energy";
import { getUserData } from "@/query/user";
import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import CSVExportButton from "./csv-export-button";
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
                    <CardTitle>Verbrauch / Leistung / Einspeisung</CardTitle>
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

    const data = await getEnergyDataForSensor(startDate, endDate, sensorId, aggregation);
    const showPeaks = fulfills(user.appVersion, Versions.self_reflection) || hasAggregation;

    const userData = await getUserData(user.id);
    const workingPrice = hasAggregation ? undefined : userData?.workingPrice ?? undefined;
    const cost =
        workingPrice && userData?.basePrice
            ? (userData.basePrice / (30 * 24 * 60 * 60)) * 15 + workingPrice
            : workingPrice;

    const peaks: SensorDataSequenceType[] =
        !hasAggregation && fulfills(user.appVersion, Versions.self_reflection)
            ? await getSensorDataSequences(sensorId)
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
                        {/* TODO: Remove this piece of shit. */}
                        {peaks.map((peak) => (
                            <PeakButton key={peak.id} peak={peak} userId={userId} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <CardTitle>Verbrauch / Leistung / Einspeisung</CardTitle>
                        <CardDescription>Im ausgewählten Zeitraum</CardDescription>
                    </div>
                    {user.id !== "demo" ? (
                        <CSVExportButton
                            userId={csvExportData.userId}
                            userHash={csvExportData.userHash}
                            endpoint={csvExportData.endpoint}
                        />
                    ) : null}
                </div>
                {user.id !== "demo" ? (
                    <div className="flex flex-row gap-4">
                        <DashboardEnergyAggregation selected={aggregation} />
                    </div>
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                        </div>
                    ) : (
                        <EnergyConsumptionCardChart
                            data={data}
                            aggregation={aggregation}
                            userId={userId}
                            cost={cost}
                            showPeaks={showPeaks}
                            peaks={peaks}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
