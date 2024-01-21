import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getAvgEnergyConsumptionForSensor, getAvgEnergyConsumptionForUserInComparison, getElectricitySensorIdForUser } from "@/query/energy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default async function AvgEnergyConsumptionComparisonCard() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        throw new Error("Kein Stromsensor für diesen Benutzer gefunden");
    }

    const avg = await getAvgEnergyConsumptionForUserInComparison(session.user.id);
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
                        {avg.avg} Wh
                    </p>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
