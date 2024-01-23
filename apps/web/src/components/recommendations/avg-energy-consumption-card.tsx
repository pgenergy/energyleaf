import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getAvgEnergyConsumptionForSensor, getElectricitySensorIdForUser } from "@/query/energy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default async function AvgEnergyConsumptionCard() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        throw new Error("Kein Stromsensor für diesen Benutzer gefunden");
    }

    const avg = await getAvgEnergyConsumptionForSensor(sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Deine durchschnittliche Energieverbrauch</CardDescription>
            </CardHeader>
            <CardContent>
                {avg ? (
                    <h1 className="text-center text-2xl font-bold text-primary">{avg} Wh</h1>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
