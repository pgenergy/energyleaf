import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import HourChart from "@energyleaf/ui/charts/hour-chart";

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
        return null;
    }

    const data = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, AggregationType.HOUR, "sum");
    if (!data || data.length === 0) {
        return null;
    }

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
