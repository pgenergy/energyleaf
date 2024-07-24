import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { InfoIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregation: AggregationType;
    hideAlert?: boolean;
    title?: React.ReactNode;
}

export default async function CostAbsoluteChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice || !userData.basePrice) {
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
    const totalCost = userData.workingPrice * total;

    return (
        <>
            {props.title ? props.title : null}
            <Card>
                <CardHeader>
                    <CardTitle>Absolute Kosten</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold font-mono">{totalCost.toFixed(2)} €</p>
                </CardContent>
            </Card>
            <div className="hidden md:col-span-1 md:block" />
            <div className="hidden md:col-span-1 md:block" />
        </>
    );
}
