import { getNationalAverageCost } from "@/components/costs/get-national-average-cost";
import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsChangeLastSevenDaysNationalAverage({ userData, energyData }) {
    const now = new Date();
    const lastSevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const thisWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= lastSevenDays && date < now;
    });

    if (thisWeekData.length < 7) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind noch nicht genug Daten vorhanden
                    </p>
                </CardContent>
            </Card>
        );
    }

    const nationalAverageCost = getNationalAverageCost(userData, 7);
    if (nationalAverageCost === null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind keine Daten für den Vergleich verfügbar
                    </p>
                </CardContent>
            </Card>
        );
    }

    const thisWeekCosts = calculateCosts(userData, thisWeekData);
    const costDifference = thisWeekCosts - nationalAverageCost;
    const percentageChange = (costDifference / nationalAverageCost) * 100;

    const color = costDifference >= 0 ? "text-red-500" : "text-green-500";
    const sign = costDifference >= 0 ? "+" : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
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

export default EnergyCostsChangeLastSevenDaysNationalAverage;
