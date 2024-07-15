import { getNationalAverageCost } from "@/components/costs/get-national-average-cost";
import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsChangeLastThirtyDaysNationalAverage({ userData, energyData }) {
    const now = new Date();
    const lastThirtyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const thisMonthData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= lastThirtyDays && date < now;
    });

    if (thisMonthData.length < 30) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind noch nicht genug Daten vorhanden
                    </p>
                </CardContent>
            </Card>
        );
    }

    const nationalAverageCost = getNationalAverageCost(userData, 30);
    if (nationalAverageCost === null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind keine Daten für den Vergleich verfügbar
                    </p>
                </CardContent>
            </Card>
        );
    }

    const thisMonthCosts = calculateCosts(userData, thisMonthData);
    const costDifference = thisMonthCosts - nationalAverageCost;
    const percentageChange = (costDifference / nationalAverageCost) * 100;

    const color = costDifference >= 0 ? "text-red-500" : "text-green-500";
    const sign = costDifference >= 0 ? "+" : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
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

export default EnergyCostsChangeLastThirtyDaysNationalAverage;
