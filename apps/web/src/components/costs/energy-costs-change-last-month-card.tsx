import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function getLastMonthDates() {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startOfLastMonth, endOfLastMonth };
}

function EnergyCostsChangeLastMonth({ userData, energyData }) {
    const { startOfLastMonth, endOfLastMonth } = getLastMonthDates();
    const startOfPreviousMonth = new Date(startOfLastMonth.getFullYear(), startOfLastMonth.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(startOfLastMonth.getFullYear(), startOfLastMonth.getMonth(), 0);

    const lastMonthData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfPreviousMonth && date <= endOfPreviousMonth;
    });
    const thisMonthData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    if (lastMonthData.length < 30 || thisMonthData.length < 30) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzter Monat vs. Vormonat</CardTitle>
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
                <CardTitle>Energiekosten: Letzter Monat vs. Vormonat</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={"text-center font-bold text-xl"}>
                    Kosten letzter Monat: {formatNumber(thisMonthCosts)} €
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

export default EnergyCostsChangeLastMonth;
