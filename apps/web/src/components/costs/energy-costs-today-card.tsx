import { calculateCosts } from "@/components/dashboard/energy-cost";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserDataHistory } from "@/query/user";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { redirect } from "next/navigation";

export default async function EnergyCostsToday() {
    const { session, user } = await getSession();

    if (!session) {
        redirect("/");
        return;
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten heute</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDate = new Date();

    const energyDataRaw = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const userData = await getUserDataHistory(userId);
    const rawCosts = calculateCosts(userData, energyDataRaw);
    const cost = rawCosts.toFixed(2);
    const parsedCost = Number.parseFloat(cost);
    const formattedCost = formatNumber(parsedCost);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten heute</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}
