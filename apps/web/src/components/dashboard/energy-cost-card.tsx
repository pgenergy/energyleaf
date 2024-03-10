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

    const price = userData ? userData.user_data.basePrice ?? 0 : 0;
    const absolute = energyData.reduce((acc, cur) => acc + cur.value, 0);
    const cost = parseFloat((absolute * price).toFixed(2));

    const monthlyPayment = userData ? userData.user_data.monthlyPayment ?? 0 : 0;
    let formattedCalculatedPayment = "N/A";
    let calculatedPayment = "0";

    if (monthlyPayment > 0) {
        calculatedPayment = getCalculatedPayment(monthlyPayment, startDate, endDate);
        formattedCalculatedPayment = parseFloat(calculatedPayment).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const predictedCost = getPredictedCost(price, energyData);
    const formattedPredictedCost = predictedCost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const forecastMonth = format(new Date(), "MMMM yyyy", {locale: de});

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ? (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    ) : (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })} - {format(endDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <>
                    <h1 className="text-center text-2xl font-bold text-primary">{cost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</h1>
                    <p className={`text-center ${cost > parseFloat(calculatedPayment) ? "text-red-500" : "text-primary"}`}>
                        Abschlag: {formattedCalculatedPayment} €
                    </p>
                    <p className="text-center">
                        Hochrechnung {forecastMonth}: {formattedPredictedCost} €
                    </p>
                </>
            </CardContent>
        </Card>
    );
}
