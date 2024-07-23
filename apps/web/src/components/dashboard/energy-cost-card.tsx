import { calculateCosts } from "@/components/dashboard/energy-cost";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserDataHistory } from "@/query/user";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function EnergyCostCard({ startDate, endDate }: Props) {
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
                    <CardTitle>Energiekosten</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-muted-foreground">Keine Sensordaten vorhanden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyDataRaw = await getEnergyDataForSensor(startDate, endDate, sensorId);

    const userData = await getUserDataHistory(userId);

    const rawCosts = calculateCosts(userData, energyDataRaw.data);
    const cost = rawCosts.toFixed(2);
    const parsedCost = Number.parseFloat(cost);
    const formattedCost = formatNumber(parsedCost);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                {parsedCost > 0 ? (
                    <p className="text-center font-bold font-mono">{formattedCost} €</p>
                ) : (
                    <Link
                        href="/settings"
                        className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                    >
                        Preis in den Einstellungen festlegen <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
