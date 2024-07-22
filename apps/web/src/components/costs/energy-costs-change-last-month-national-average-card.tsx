import { calculateCosts } from "@/components/dashboard/energy-cost";
import { getNationalAverageCost } from "@/lib/costs/get-national-average-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function getLastMonthDates() {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startOfLastMonth, endOfLastMonth };
}

function EnergyCostsChangeLastMonthNationalAverage({ userData, energyData }) {
    const { startOfLastMonth, endOfLastMonth } = getLastMonthDates();

    const thisMonthData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    if (thisMonthData.length < 30) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Letzter Monat vs. Deutscher Durchschnitt</CardTitle>
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
                    <CardTitle>Letzter Monat vs. Deutscher Durchschnitt</CardTitle>
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
                <CardTitle>Letzter Monat vs. Deutscher Durchschnitt</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={"text-center font-bold text-xl"}>
                    Letzter Monat: {formatNumber(thisMonthCosts)} €
                </p>
                <p className={"text-center font-bold text-xl"}>
                    Deutscher Durchschnitt: {formatNumber(nationalAverageCost)} €
                </p>
                <p className={`text-center font-bold text-2xl ${color}`}>
                    {sign}
                    {formatNumber(costDifference)} € ({sign}
                    {formatNumber(percentageChange)}%)
                </p>
            </CardContent>
        </Card>
    );
}

export default EnergyCostsChangeLastMonthNationalAverage;
