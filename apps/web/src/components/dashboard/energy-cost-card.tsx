import Link from "next/link";
import { redirect } from "next/navigation";
import { getCalculatedPayment, getPredictedCost } from "@/components/dashboard/energy-cost";
import { getSession } from "@/lib/auth/auth";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function EnergyCostCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
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

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const userData = await getUserData(userId);
    const price = userData?.user_data?.basePrice || null;
    const absolute = energyData.reduce((acc, cur) => acc + cur.value, 0) / 1000;
    const cost = price ? parseFloat((absolute * price).toFixed(2)) : null;

    const monthlyPayment = userData?.user_data?.monthlyPayment;
    let formattedCalculatedPayment = "N/A";
    let calculatedPayment: string | null = null;

    if (monthlyPayment !== null && monthlyPayment !== undefined) {
        calculatedPayment = getCalculatedPayment(monthlyPayment, startDate, endDate);
        formattedCalculatedPayment = calculatedPayment !== null ? parseFloat(calculatedPayment).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A";
    }

    const predictedCost = (cost ?? 0) + (price ? getPredictedCost(price, energyData) : 0);
    const formattedPredictedCost = predictedCost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const forecastMonth = format(new Date(), "MMMM yyyy", {locale: de});

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
                <CardDescription>
                    {format(startDate, "PPP", {locale: de})} - {format(endDate, "PPP", {locale: de})}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {cost !== null ? (
                    <>
                        <h1 className="text-center text-2xl font-bold text-primary">{cost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</h1>
                        <p className={`text-center ${cost > parseFloat(calculatedPayment ?? '0') ? "text-red-500" : "text-primary"}`}>
                            Abschlag: {formattedCalculatedPayment} €
                        </p>
                        <p className="text-center">
                            Hochrechnung {forecastMonth}: {formattedPredictedCost} €
                        </p>
                    </>
                ) : (
                    <Link href="/profile" className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                        Preis im Profil festlegen <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
