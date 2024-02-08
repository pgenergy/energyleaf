import Link from "next/link";
import { getCalculatedPayment, getPredictedCost } from "@/components/dashboard/energy-cost";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowRightIcon } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
    sensorId: string | null;
    energyData: {
        id: number;
        timestamp: Date | null;
        value: number;
        sensorId: string | null;
    }[];
    userData: {
        user_data: {
            id: number;
            userId: number;
            timestamp: Date;
            property: "house" | "apartment" | null;
            budget: number | null;
            basePrice: number | null;
            workingPrice: number | null;
            tariff: "basic" | "eco" | null;
            limitEnergy: number | null;
            household: number | null;
            livingSpace: number | null;
            hotWater: "electric" | "not_electric" | null;
            monthlyPayment: number | null;
        };
        mail: {
            id: number;
            userId: number;
            mailDaily: boolean;
            mailWeekly: boolean;
        };
    } | null;
}

export default function EnergyCostCard({ startDate, endDate, sensorId, energyData, userData }: Props) {
    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten</CardTitle>
                    <CardDescription>Dein Sensor konnte nicht gefunden werden</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const price = userData?.user_data.basePrice;
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0) / 1000;
    const cost: number | null = price ? parseFloat((absolut * price).toFixed(2)) : null;

    const monthlyPayment = userData?.user_data.monthlyPayment;
    const calculatedPayment = getCalculatedPayment(monthlyPayment, startDate, endDate);
    const predictedCost = (cost ?? 0) + getPredictedCost(price, energyData);

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
                            Hochrechnung {new Date().getMonth() + 1}.{new Date().getFullYear()}: {predictedCost} €
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
