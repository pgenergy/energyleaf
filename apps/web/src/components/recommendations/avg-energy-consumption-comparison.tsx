import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth.server";
import {
    getAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser,
} from "@/query/energy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

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
                    <CardDescription>Dein Sensor konnte nicht gefunden werden</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const avg = await getAvgEnergyConsumptionForUserInComparison(userId);
    const avgUser = await getAvgEnergyConsumptionForSensor(sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Im Vergleich zu anderen Nutzern mit Vergleichbaren Daten</CardDescription>
            </CardHeader>
            <CardContent>
                {avg && avgUser ? (
                    <p className="text-center text-2xl text-primary">
                        <span className="font-bold">Durchschnitt: </span>
                        {avg.avg.toFixed(2)} Wh
                    </p>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
