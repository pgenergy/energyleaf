import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
    showDescription?: boolean;
}

export default async function AbsolutEnergyConsumptionCard({ startDate, endDate, showDescription = true }: Props) {
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
                    <CardTitle>Absoluter Energieverbrauch</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-muted-foreground">Keine Sensordaten vorhanden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyData = await getEnergyDataForSensor(startDate.toISOString(), endDate.toISOString(), sensorId);
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Absoluter Energieverbrauch</CardTitle>
                {showDescription ? <CardDescription>Im ausgewählten Zeitraum</CardDescription> : null}
            </CardHeader>
            <CardContent>
                <h1 className="text-center font-bold font-mono">{formatNumber(absolut)} kWh</h1>
            </CardContent>
        </Card>
    );
}
