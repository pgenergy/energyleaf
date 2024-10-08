import { getElectricitySensorIdForUser, getEnergyDataForSensor, getSensorDataSequences } from "@/query/energy";
import { getUserData } from "@/query/user";
import { AggregationType } from "@energyleaf/lib";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import type { SensorDataSequenceSelectType } from "@energyleaf/postgres/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import DashboardEnergyAggregation from "./energy-aggregation-option";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregationType: string | undefined;
    userId: string;
    appVersion: number;
}

export default async function EnergyConsumptionCard({
    startDate,
    endDate,
    aggregationType,
    userId,
    appVersion,
}: Props) {
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Verbrauch, Leistung, Einspeisung und Kosten</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold font-mono">Keine Sensoren gefunden</p>
                </CardContent>
            </Card>
        );
    }

    let aggregation = AggregationType.RAW;
    if (aggregationType) {
        aggregation = AggregationType[aggregationType.toUpperCase() as keyof typeof AggregationType];
    }
    const hasAggregation = aggregation !== AggregationType.RAW;
    const data = await getEnergyDataForSensor(startDate.toISOString(), endDate.toISOString(), sensorId, aggregation);

    const showPeaks = fulfills(appVersion, Versions.self_reflection) && !hasAggregation;
    const peaks: SensorDataSequenceSelectType[] = showPeaks
        ? await getSensorDataSequences(sensorId, { start: startDate, end: endDate })
        : [];

    const userData = await getUserData(userId);
    const workingPrice = userData?.workingPrice ?? undefined;
    const cost =
        workingPrice && userData?.basePrice
            ? (userData.basePrice / (30 * 24 * 60 * 60)) * 15 + workingPrice
            : workingPrice;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start">
                <CardTitle>Verbrauch, Leistung, Einspeisung und Kosten</CardTitle>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
                {userId !== "demo" ? (
                    <div className="flex flex-row gap-4">
                        <DashboardEnergyAggregation selected={aggregation} startDate={startDate} endDate={endDate} />
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
                            appVersion={appVersion}
                            cost={cost}
                            showPeaks={showPeaks}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
