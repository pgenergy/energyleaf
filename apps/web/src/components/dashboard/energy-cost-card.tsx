import Link from "next/link";
import { redirect } from "next/navigation";
import { calculateCosts, getCalculatedPayment, getPredictedCost } from "@/components/dashboard/energy-cost";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserDataHistory } from "@/query/user";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

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
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyDataRaw = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const energyData = energyDataRaw.map(data => ({
        ...data,
        timestamp: (typeof data.timestamp === 'string' || typeof data.timestamp === 'number') ? new Date(data.timestamp) : new Date()
    }));

    const userData = await getUserDataHistory(userId);

    const rawCosts = calculateCosts(userData, energyData);
    const cost = rawCosts.toFixed(2);

    const calculatedPayment = getCalculatedPayment(userData, startDate, endDate);
    const predictedCost = getPredictedCost(userData, energyData);

    const parsedCost = parseFloat(cost);
    const parsedCalculatedPayment = parseFloat(calculatedPayment || "0");

    const formattedCost = parsedCost.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedCalculatedPayment = parsedCalculatedPayment.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const formattedPredictedCost = predictedCost.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const forecastMonth = format(new Date(), "MMMM yyyy", { locale: de });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ? (
                        <>{format(startDate, "PPP", { locale: de })}</>
                    ) : (
                        <>
                            {format(startDate, "PPP", { locale: de })} - {format(endDate, "PPP", { locale: de })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {parsedCost > 0 ? (
                    <>
                        <h1 className="text-center text-2xl font-bold text-primary">{formattedCost} €</h1>
                        <p
                            className={`text-center ${parsedCost > parsedCalculatedPayment ? "text-red-500" : "text-primary"}`}
                        >
                            Abschlag: {formattedCalculatedPayment} €
                        </p>
                        <p className="text-center">
                            Hochrechnung {forecastMonth}: {formattedPredictedCost} €
                        </p>
                    </>
                ) : (
                    <Link
                        href="/profile"
                        className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                        Preis im Profil festlegen <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
