import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsChangeLastThirtyDays({ userData, energyData }) {
    const now = new Date();
    const lastThirtyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

    const lastMonthData = energyData.filter(
        (data) => new Date(data.timestamp) >= sixtyDaysAgo && new Date(data.timestamp) < lastThirtyDays,
    );
    const thisMonthData = energyData.filter(
        (data) => new Date(data.timestamp) >= lastThirtyDays && new Date(data.timestamp) < now,
    );

    if (lastMonthData.length < 30 || thisMonthData.length < 30) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 30 Tage vs. Vormonat</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind noch nicht genug Daten vorhanden
                    </p>
                </CardContent>
            </Card>
        );
    }

    const lastMonthCosts = calculateCosts(userData, lastMonthData);
    const thisMonthCosts = calculateCosts(userData, thisMonthData);
    const costDifference = thisMonthCosts - lastMonthCosts;
    const percentageChange = (costDifference / lastMonthCosts) * 100;

    const color = costDifference >= 0 ? "text-red-500" : "text-green-500";
    const sign = costDifference >= 0 ? "+" : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 30 Tage vs. Vormonat</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-center font-bold text-2xl ${color}`}>
                    {sign}
                    {formatNumber(costDifference)} € ({sign}
                    {formatNumber(percentageChange)}%)
                </p>
            </CardContent>
        </Card>
    );
}

export default EnergyCostsChangeLastThirtyDays;
