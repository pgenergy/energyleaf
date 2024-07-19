import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import DayChart from "@energyleaf/ui/charts/day-chart";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function DayChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);

    if (!sensorId) {
        return <NoDataView />;
    }

    const data = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, AggregationType.DAY, "sum");
    if (!data || data.length === 0) {
        return <NoDataView />;
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Wochentage</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbauch, an den gegebenen Wochentage</CardDescription>
            </CardHeader>
            <CardContent>
                <DayChart data={data} />
            </CardContent>
        </Card>
    );
}

function NoDataView() {
    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Wochentage</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbauch, an den gegebenen Wochentage</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">Keine Sensordaten vorhanden</p>
            </CardContent>
        </Card>
    );
}
