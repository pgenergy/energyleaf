import { getSession } from "@/lib/auth/auth.server";
import { calculateCosts } from "@/lib/costs/energy-cost";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { ArrowRightIcon, Info } from "lucide-react";
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

    const energyDataRaw = await getEnergyDataForSensor(startDate.toISOString(), endDate.toISOString(), sensorId);
    const userData = await getUserData(userId);
    if (!userData || !userData.workingPrice || !userData.basePrice || !userData.monthlyPayment) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten</CardTitle>
                    <CardDescription>Bitte legen sie Preise im Profil fest</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href="/settings"
                        className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                    >
                        Preis in den Einstellungen festlegen <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const { totalCost, totalWorkingCost, totalBasePrice } = calculateCosts(userData, energyDataRaw);
    const parsedTotalCost = Number.parseFloat(totalCost.toFixed(2));
    const parsedTotalWorkingCost = Number.parseFloat(totalWorkingCost.toFixed(2));
    const parsedTotalBaseCost = Number.parseFloat(totalBasePrice.toFixed(2));

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-row items-center gap-2">
                    <CardTitle>Energiekosten</CardTitle>
                    <Popover>
                        <PopoverTrigger>
                            <Info className="h-5 w-5" />
                        </PopoverTrigger>
                        <PopoverContent className="text-s">
                            Der Preis setzt sich aus den in diesen Zeitraum fälligen Grundkosten (
                            {formatNumber(parsedTotalBaseCost)} €) und den eigentlichen Kosten für den Verbrauch (
                            {formatNumber(parsedTotalWorkingCost)} €) zusammen.
                        </PopoverContent>
                    </Popover>
                </div>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                {parsedTotalCost > 0 ? (
                    <h1 className="text-center font-bold font-mono">{formatNumber(parsedTotalCost)} €</h1>
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
