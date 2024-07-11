import { getSession } from "@/lib/auth/auth.server";
import { getEnergyLastEntry } from "@/query/energy";
import { getElectricitySensorIdForUser } from "@energyleaf/db/query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default async function CurrentMeterOutCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const value = await getEnergyLastEntry(sensorId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktuelle Eingespeiste Energie</CardTitle>
                <CardDescription>Unabhängig vom Zeitraum</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-medium">{value?.valueOut?.toFixed(0) || 0} kWh</p>
            </CardContent>
        </Card>
    );
}
