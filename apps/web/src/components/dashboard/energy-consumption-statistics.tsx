import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

interface EnergyDataItem {
    value: number;
}

export default async function EnergyConsumptionStatisticCard({ startDate, endDate }: Props) {
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
                    <CardTitle>Durchschnittlicher Verbrauch</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const energyValues = energyData.map((entry) => entry.value);
    const sumConsumption = energyValues.reduce((acc, cur) => acc + cur, 0);
    const averageConsumption = energyValues.length > 0 ? sumConsumption / energyValues.length : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Verbrauch</CardTitle>
                <CardDescription>Im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formatNumber(averageConsumption)} kWh</p>
            </CardContent>
        </Card>
    );
}
