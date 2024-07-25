import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor, getSensorDataSequences, classifyDeviceUsage } from "@/query/energy";
import { getUserData } from "@/query/user";
import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";
import type { DeviceClassification } from "@energyleaf/lib";

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
    const classifiedData: DeviceClassification[] = await classifyDeviceUsage(data); // Fetch classified data
    const showPeaks = fulfills(user.appVersion, Versions.self_reflection) && !hasAggregation;

    const userData = await getUserData(user.id);
    const workingPrice = userData?.workingPrice ?? undefined;
    const cost =
        workingPrice && userData?.basePrice
            ? (userData.basePrice / (30 * 24 * 60 * 60)) * 15 + workingPrice
            : workingPrice;
    const peaks: SensorDataSequenceType[] = showPeaks
        ? await getSensorDataSequences(sensorId, { start: startDate, end: endDate })
        : [];

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start">
                <CardTitle>Verbrauch / Leistung / Einspeisung</CardTitle>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
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
                            peaks={peaks}
                            aggregation={aggregation}
                            userId={userId}
                            cost={cost}
                            showPeaks={showPeaks}
                            classifiedData={classifiedData}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
