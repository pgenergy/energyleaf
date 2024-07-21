import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import MiniChart from "@energyleaf/ui/charts/mini-chart";
import { InfoIcon } from "lucide-react";

interface Props {
    startDate: Date;
    endDate: Date;
    aggregation: AggregationType;
}

export default async function AbsoluteChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
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
        } satisfies SensorDataSelectType;
        data.unshift(newFirst);
    }

    if (!hasValues) {
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

    const hasOutValues = data.some((d) => d.valueOut);
    const totalOut = data.reduce((acc, cur) => acc + (cur.valueOut || 0), 0);

    const hasPowerValues = data.some((d) => d.valueCurrent);
    const totalPower = data.reduce((acc, cur) => acc + (cur.valueCurrent || 0), 0);
    const averagePower = totalPower / data.length;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Absoluter Verbrauch</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2">
                    <p className="font-bold font-mono">{total.toFixed(2)} kWh</p>
                    <div className="hidden md:block">
                        <MiniChart data={data} display="value" />
                    </div>
                </CardContent>
            </Card>
            {hasOutValues ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Absolut Eingespeist</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2">
                        <p className="font-bold font-mono">{totalOut.toFixed(2)} kWh</p>
                        <div className="hidden md:block">
                            <MiniChart data={data} display="valueOut" />
                        </div>
                    </CardContent>
                </Card>
            ) : null}
            {hasPowerValues ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Durchschnittliche Leistung</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2">
                        <p className="font-bold font-mono">{averagePower.toFixed(2)} W</p>
                        <div className="hidden md:block">
                            <MiniChart data={data} display="valueCurrent" />
                        </div>
                    </CardContent>
                </Card>
            ) : null}
            {!hasOutValues ? <div className="col-span-1" /> : null}
            {!hasPowerValues ? <div className="col-span-1" /> : null}
        </>
    );
}

interface NotFoundProps {
    title: string;
}

function NotFound(props: NotFoundProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{props.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">Keine Sensordaten vorhanden</p>
            </CardContent>
        </Card>
    );
}
