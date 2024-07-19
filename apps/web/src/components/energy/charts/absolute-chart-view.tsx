import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import AbsoluteMiniChart from "./absolute-mini-chart";

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
            <>
                <NotFound title="Absoluter Verbrauch" />
                <NotFound title="Absolut Eingespeist" />
                <NotFound title="Durchschnittliche Leistung" />
            </>
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
            <>
                <NotFound title="Absoluter Verbrauch" />
                <NotFound title="Absolut Eingespeist" />
                <NotFound title="Durchschnittliche Leistung" />
            </>
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
                    <AbsoluteMiniChart data={data} display="value" />
                </CardContent>
            </Card>
            {hasOutValues ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Absolut Eingespeist</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2">
                        <p className="font-bold font-mono">{totalOut.toFixed(2)} kWh</p>
                        <AbsoluteMiniChart data={data} display="valueOut" />
                    </CardContent>
                </Card>
            ) : (
                <NotFound title="Absolut Eingespeist" />
            )}
            {hasPowerValues ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Durchschnittliche Leistung</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2">
                        <p className="font-bold font-mono">{averagePower.toFixed(2)} W</p>
                        <AbsoluteMiniChart data={data} display="valueCurrent" />
                    </CardContent>
                </Card>
            ) : (
                <NotFound title="Durchschnittliche Leistung" />
            )}
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
                <p className="text-center text-muted-foreground">Keine Sensordaten Vorhanden</p>
            </CardContent>
        </Card>
    );
}
