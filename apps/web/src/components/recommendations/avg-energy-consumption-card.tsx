import { getSession } from "@/lib/auth/auth.server";
import { getAvgEnergyConsumptionForSensor, getElectricitySensorIdForUser } from "@/query/energy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { redirect } from "next/navigation";
import { formatNumber } from "@/lib/consumption/number-format";

export default async function AvgEnergyConsumptionCard() {
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

    const avg = await getAvgEnergyConsumptionForSensor(sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Hier sehen Sie Ihren durchschnittlichen Energieverbrauch über die gesamte Zeit</CardDescription>
            </CardHeader>
            <CardContent>
                {avg ? (
                    <h1 className="text-center font-bold text-2xl text-primary">{formatNumber(avg)} kWh</h1>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
