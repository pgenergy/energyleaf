import { getSession } from "@/lib/auth/auth.server";
import { getEnergyLastEntry } from "@/query/energy";
import { getElectricitySensorIdForUser } from "@energyleaf/db/query";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui";

export default async function CurrentMeterPowerCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const value = await getEnergyLastEntry(sensorId);
    if (!value?.valueCurrent) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktuelle Leistung</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-medium">{value.valueCurrent.toFixed(6)} W</p>
            </CardContent>
        </Card>
    );
}
