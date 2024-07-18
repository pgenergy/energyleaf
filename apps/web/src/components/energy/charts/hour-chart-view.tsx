import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getTimezoneOffset } from "date-fns-tz";
import HourChart from "./hour-chart";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function HourChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);

    if (!sensorId) {
        return <NoDataView />;
    }

    const rawData = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, AggregationType.HOUR, true);
    if (!rawData || rawData.length === 0) {
        return <NoDataView />;
    }

    const fillArray = () => {
        const result: SensorDataSelectType[] = [];
        const offset = getTimezoneOffset("Europe/Berlin", new Date());
        const localOffset = Math.abs(new Date().getTimezoneOffset() * 60 * 1000);
        const date = new Date();

        for (let i = 0; i < 24; i++) {
            date.setHours(i, 0, 0, 0);
            const calcDate = offset === localOffset ? new Date(date) : new Date(date.getTime() - offset);

            result.push({
                id: i.toString(),
                sensorId: sensorId,
                timestamp: calcDate,
                value: 0,
                valueOut: null,
                valueCurrent: null,
                isPeak: false,
                isAnomaly: false,
            });
        }

        return result;
    };

    const data = rawData.reduce((acc, cur) => {
        const index = acc.findIndex((item) => item.timestamp.getHours() === cur.timestamp.getHours());
        if (index !== -1) {
            const existing = acc[index];
            existing.value = cur.value;
            if (cur.valueOut) {
                if (!existing.valueOut) {
                    existing.valueOut = cur.valueOut;
                }
            }
            if (cur.valueCurrent) {
                if (!existing.valueCurrent) {
                    existing.valueCurrent = cur.valueCurrent;
                }
            }
        }

        return acc;
    }, fillArray());

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Stunden</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch über die Stunden</CardDescription>
            </CardHeader>
            <CardContent>
                <HourChart data={data} />
            </CardContent>
        </Card>
    );
}

function NoDataView() {
    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Stunden</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch über die Stunden</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">Keine Sensordaten vorhanden</p>
            </CardContent>
        </Card>
    );
}
