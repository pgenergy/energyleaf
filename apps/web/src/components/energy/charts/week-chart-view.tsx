import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import WeekChart from "@energyleaf/ui/charts/week-chart";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function WeekChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);

    if (!sensorId) {
        return null;
    }

    const data = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, AggregationType.WEEK, "sum");
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Wochen</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch der Wochen in diesem Monat</CardDescription>
            </CardHeader>
            <CardContent>
                <WeekChart data={data} />
            </CardContent>
        </Card>
    );
}
