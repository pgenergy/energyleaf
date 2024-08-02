import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { AggregationType } from "@energyleaf/lib";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import CompareChart from "@energyleaf/ui/charts/energy/compare-chart";
import { InfoIcon } from "lucide-react";

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
        return (
            <Alert className="col-span-1 md:col-span-3">
                <InfoIcon className="mr-2 h-4 w-4" />
                <AlertTitle>Keine Sensordaten vorhanden</AlertTitle>
                <AlertDescription>
                    Zu dieser Zeit liegen keien Daten von Ihrem Sensor vor. Der Grund hierfür ist vermutlich, dass bei
                    Ihnen noch kein Sensor installiert wurde.
                </AlertDescription>
            </Alert>
        );
    }

    const data = await getEnergyDataForSensor(
        props.startDate.toISOString(),
        props.endDate.toISOString(),
        sensorId,
        AggregationType.HOUR,
        "sum",
    );
    const compareData = await getEnergyDataForSensor(
        props.compareStartDate.toISOString(),
        props.compareEndDate.toISOString(),
        sensorId,
        AggregationType.HOUR,
        "sum",
    );
    if (!compareData || compareData.length === 0 || !data || data.length === 0) {
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

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Vergleich Stunden</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch der Wochen in diesem Monat</CardDescription>
            </CardHeader>
            <CardContent>
                <CompareChart
                    data={data}
                    compareData={compareData}
                    date={props.startDate}
                    compareDate={props.compareStartDate}
                />
            </CardContent>
        </Card>
    );
}
