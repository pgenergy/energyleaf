import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { AggregationType } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import CostWeekChart from "@energyleaf/ui/charts/costs/week-chart";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function CostWeekChartView(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData || !userData.workingPrice) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const data = await getEnergyDataForSensor(
        props.startDate.toISOString(),
        props.endDate.toISOString(),
        sensorId,
        AggregationType.WEEK,
        "sum",
    );
    if (!data || data.length === 0) {
        return null;
    }

    const workingPrice = userData.workingPrice;
    const totalBaseCost = userData.basePrice ? userData.basePrice / 4 : 0;
    const processedData = data.map((d) => ({
        ...d,
        cost: d.consumption * workingPrice + totalBaseCost,
    }));

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader>
                <CardTitle>Übersicht der Wochen</CardTitle>
                <CardDescription>Hier sehen Sie Ihren absoluten Verbrauch der Wochen in diesem Monat</CardDescription>
            </CardHeader>
            <CardContent>
                <CostWeekChart data={processedData} />
            </CardContent>
        </Card>
    );
}
