import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import CompareChart from "@energyleaf/ui/charts/compare-chart";

interface Props {
    startDate: Date;
    endDate: Date;
    compareStartDate: Date;
    compareEndDate: Date;
}

export default async function CompareChartView(props: Props) {
    const { user } = await getSession();

    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);

    if (!sensorId) {
        return <NoDataView type="normal" />;
    }

    const data = await getEnergyDataForSensor(props.startDate, props.endDate, sensorId, AggregationType.HOUR, "sum");
    if (!data || data.length === 0) {
        return <NoDataView type="compare" />;
    }

    const compareData = await getEnergyDataForSensor(
        props.compareStartDate,
        props.compareEndDate,
        sensorId,
        AggregationType.HOUR,
        "sum",
    );
    if (!compareData || compareData.length === 0) {
        return <NoDataView type="compare" />;
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Vergleich Stunden</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch der Wochen in diesem Monat</CardDescription>
            </CardHeader>
            <CardContent>
                <CompareChart data={data} compareData={compareData} />
            </CardContent>
        </Card>
    );
}

interface NoDataProps {
    type: "normal" | "compare";
}

function NoDataView(props: NoDataProps) {
    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Vergleich Stunden</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch im Vergleich in Stunden</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    {props.type === "normal"
                        ? "Keine Sensordaten vorhanden"
                        : "Es stehen keine Sensordaten zum Vergleich zur Verfügung"}
                </p>
            </CardContent>
        </Card>
    );
}
