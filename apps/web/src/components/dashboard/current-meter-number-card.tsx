import { getSession } from "@/lib/auth/auth.server";
import { getEnergyLastEntry } from "@/query/energy";
import { getElectricitySensorIdForUser } from "@energyleaf/db/query";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default async function CurrentMeterNumberCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const value = await getEnergyLastEntry(sensorId);
    if (!value) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktueller Zählerstand</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-medium">{value.value.toFixed(4)} kWh</p>
            </CardContent>
        </Card>
    );
}
