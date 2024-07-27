import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { getUserData } from "@/query/user";
import { AggregationType, convertTZDate } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import CostDiscountChart from "@energyleaf/ui/charts/costs/discount-chart";
import { endOfMonth, startOfMonth } from "date-fns";

export default async function CostDiscountView() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.monthlyPayment || !userData?.workingPrice) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const serverStartDate = startOfMonth(new Date());
    serverStartDate.setHours(0, 0, 0, 0);
    const serverEndDate = endOfMonth(new Date());
    serverEndDate.setHours(0, 0, 0, 0);

    const startDate = convertTZDate(serverStartDate);
    const endDate = convertTZDate(serverEndDate);

    const data = await getEnergyDataForSensor(
        startDate.toISOString(),
        endDate.toISOString(),
        sensorId,
        AggregationType.DAY,
        "sum",
    );
    if (!data || data.length <= 0) {
        return null;
    }

    const totalBaseCost = userData.basePrice ? userData.basePrice / 30 : 0;
    const workingPrice = userData.workingPrice;
    const processedData = data.map((entry, i) => {
        const energyBefore = data.slice(0, i).reduce((acc, cur) => acc + cur.value, 0);
        return {
            ...entry,
            cost:
                i === 0
                    ? entry.value * workingPrice + totalBaseCost
                    : (entry.value + energyBefore) * workingPrice + totalBaseCost,
        };
    });
    const dailyCost = userData.monthlyPayment / 30;

    return (
        <>
            <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                    <CardTitle>Monatlicher Abschlag</CardTitle>
                    <CardDescription>
                        Deine Kosten hochgerechnet auf diesen Monat, basierend auf deinen Daten
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CostDiscountChart dailyCost={dailyCost} data={processedData} />
                </CardContent>
            </Card>
        </>
    );
}
