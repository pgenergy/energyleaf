import Link from "next/link";
import { redirect } from "next/navigation";
import {energyDataJoinUserData, getCalculatedPayment, getPredictedCost} from "@/components/dashboard/energy-cost";
import { getSession } from "@/lib/auth/auth";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import {getUserDataHistory} from "@/query/user";
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
    const userData = await getUserDataHistory(session.user.id);
    const joinedData = energyDataJoinUserData(energyData, userData);

    const costString = joinedData.reduce(
        (acc, cur) => {
            const consumptionInKWh = cur.energyData.value / 1000;
            return acc + consumptionInKWh * (cur.userData?.basePrice ?? 0);
        },
        0
    ).toFixed(2);
    const cost = parseFloat(costString);

    const monthlyPayment = 0; // TODO
    const calculatedPayment = 0; // TODO
    const predictedCost = 0; // TODO

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
                            })}{" "}
                            -{" "}
                            {format(endDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {cost !== null ? (
                    <>
                        <h1 className="text-center text-2xl font-bold text-primary">{cost} €</h1>
                        <p
                            className={`text-center ${Number(cost) > Number(calculatedPayment) ? "text-red-500" : "white"}`}
                        >
                            Abschlag: {calculatedPayment} €
                        </p>
                        <p className="text-center">
                            Hochrechnung {new Date().getMonth() + 1}.{new Date().getFullYear()}:{" "}
                            {predictedCost.toFixed(2)} €
                        </p>
                    </>
                ) : (
                    <Link
                        className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground"
                        href="/profile"
                    >
                        Preis im Profil festlegen
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
