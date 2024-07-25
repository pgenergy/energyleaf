import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { InfoIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    startDate: Date;
    endDate: Date;
    compareStartDate: Date;
    compareEndDate: Date;
    aggregation: AggregationType;
    previousTitle: string;
    hideAlert?: boolean;
    title?: React.ReactNode;
    compareCard?: boolean;
}

export default async function CostAbsoluteChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return (
            <Alert className="col-span-1 md:col-span-3">
                <InfoIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Es Fehlen Daten</AlertTitle>
                <AlertDescription>
                    In Ihrem Profil wurden bisher keine Daten zu Ihren Kosten hinterlegt. Um die Kosten einzusehen,
                    hinterlegen Sie in den{" "}
                    <Link href="/settings" className="text-primary underline hover:no-underline">
                        Einstellungen
                    </Link>{" "}
                    die nötigen Daten.
                </AlertDescription>
            </Alert>
        );
    }
    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        if (props.hideAlert) {
            return null;
        }
        return (
            <Alert className="col-span-1 md:col-span-3">
                <InfoIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Keine Sensordaten vorhanden</AlertTitle>
                <AlertDescription>
                    Zu dieser Zeit liegen keien Daten von Ihrem Sensor vor. Der Grund hierfür ist vermutlich, dass bei
                    Ihnen noch kein Sensor installiert wurde. Sollte es sich hierbei jedoch um einen Fehler handel,
                    kontaktieren Sie uns bitte.
                </AlertDescription>
            </Alert>
        );
    }

    const data = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, props.aggregation, "sum");
    const hasValues = data.length > 0;
    if (data.length === 1) {
        const newFirst = {
            id: data[0].id,
            sensorId: data[0].sensorId,
            value: data[0].value,
            valueOut: data[0].valueOut,
            valueCurrent: data[0].valueCurrent,
            timestamp: new Date(data[0].timestamp.getTime() - 10),
            cost: 0,
        } satisfies SensorDataSelectType & { cost: number };
        data.unshift(newFirst);
    }

    if (!hasValues) {
        if (props.hideAlert) {
            return null;
        }
        return (
            <Alert className="col-span-1 md:col-span-3">
                <InfoIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Keine Sensordaten vorhanden</AlertTitle>
                <AlertDescription>
                    In einem von Ihnen ausgewählten Zeitraum liegen keine Daten vor. Sollte es sich hierbei um einen
                    Fehler handeln, kontaktieren Sie uns bitte.
                </AlertDescription>
            </Alert>
        );
    }
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    const workingCost = userData.workingPrice * total;
    let totalBaseCost = 0;
    if (userData.basePrice) {
        switch (props.aggregation) {
            case AggregationType.HOUR:
                totalBaseCost = userData.basePrice / 30 / 24;
                break;
            case AggregationType.DAY:
                totalBaseCost = userData.basePrice / 30;
                break;
            case AggregationType.WEEK:
                totalBaseCost = userData.basePrice / 4;
                break;
            case AggregationType.MONTH:
                totalBaseCost = userData.basePrice;
                break;
            case AggregationType.YEAR:
                totalBaseCost = userData.basePrice * 12;
                break;
        }
    }
    const totalCost = totalBaseCost + workingCost;

    const compareData = await getEnergyDataForSensor(
        props.compareStartDate,
        props.compareEndDate,
        sensorId,
        props.aggregation,
        "sum",
    );
    const hasCompareData = compareData.length > 0;
    const compareTotal = compareData.reduce((acc, cur) => acc + cur.value, 0);
    const compareWorkingCost = userData.workingPrice * compareTotal;
    const compareTotalCost = totalBaseCost + compareWorkingCost;

    const totalChange = totalCost - compareTotalCost;
    const percentageChange = (totalCost / compareTotalCost) * 100 - 100;
    const positivTrend = totalChange < 0;

    const displayStartDate = convertTZDate(new Date(props.compareStartDate), "client");
    const displayEndDate = convertTZDate(new Date(props.compareEndDate), "client");
    const displayInitalDate = convertTZDate(new Date(props.startDate), "client");
    const sameDay = displayStartDate.getDate() === displayEndDate.getDate();

    return (
        <>
            {props.title ? props.title : null}
            <Card>
                <CardHeader>
                    <CardTitle>Absolute Kosten</CardTitle>
                    <CardDescription>
                        {props.compareCard
                            ? format(displayInitalDate, "PPP", { locale: de })
                            : "Basierend auf Ihrem Strom- und Grundpreis"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-bold font-mono">{totalCost.toFixed(2)} €</p>
                </CardContent>
            </Card>
            {hasCompareData ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center justify-between">
                            {props.previousTitle}
                            <div className="flex flex-row items-center gap-2">
                                {positivTrend ? (
                                    <TrendingUpIcon className="h-6 w-6 fill-current stroke-current text-primary" />
                                ) : (
                                    <TrendingDownIcon className="h-6 w-6 fill-current stroke-current text-destructive" />
                                )}
                                <p
                                    className={cn(
                                        {
                                            "text-destructive": !positivTrend,
                                            "text-primary": positivTrend,
                                        },
                                        "font-bold font-mono text-lg",
                                    )}
                                >
                                    {positivTrend ? "" : "+"}
                                    {percentageChange.toFixed(2)}%
                                </p>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            {sameDay
                                ? `Im vergleich zum ${format(displayStartDate, "PPP", { locale: de })}`
                                : `Vergleich zu ${format(displayStartDate, "PPP", { locale: de })} - ${format(displayEndDate, "PPP", { locale: de })}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 items-center gap-2">
                        <p
                            className={cn(
                                {
                                    "text-destructive": !positivTrend,
                                    "text-primary": positivTrend,
                                },
                                "font-bold font-mono",
                            )}
                        >
                            {positivTrend ? "" : "+"}
                            {totalChange.toFixed(2)} €
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="hidden md:col-span-1 md:block" />
            )}
            {props.compareCard ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Absolute Kosten</CardTitle>
                        <CardDescription>{format(displayStartDate, "PPP", { locale: de })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-bold font-mono">{compareTotalCost.toFixed(2)} €</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="hidden md:col-span-1 md:block" />
            )}
        </>
    );
}
