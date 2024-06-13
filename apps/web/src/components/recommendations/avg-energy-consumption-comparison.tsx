import { getSession } from "@/lib/auth/auth.server";
import {
    getAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser,
} from "@/query/energy";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { redirect } from "next/navigation";

export default async function AvgEnergyConsumptionComparisonCard() {
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
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const avg = await getAvgEnergyConsumptionForUserInComparison(userId);
    const avgUser = await getAvgEnergyConsumptionForSensor(sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Vergleich des Energieverbrauchs</CardTitle>
                <CardDescription>
                    Hier sehen Sie Ihren durchschnittlichen Energieverbrauch im Vergleich zu anderen Nutzern
                </CardDescription>
            </CardHeader>
            <CardContent>
                {avg && avgUser ? (
                    <p className="text-center text-2xl text-primary">
                        <span className="font-bold">Durchschnitt: </span>
                        {formatNumber(avg.avg)} kWh
                    </p>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
