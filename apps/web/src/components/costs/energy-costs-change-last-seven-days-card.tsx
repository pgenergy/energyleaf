import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsChangeLastSevenDays({ userData, energyData }) {
    const now = new Date();
    const lastSevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const fourteenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);

    const lastWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= fourteenDaysAgo && date < lastSevenDays;
    });
    const thisWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= lastSevenDays && date < now;
    });

    if (lastWeekData.length < 7 || thisWeekData.length < 7) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte 7 Tage vs. Vorwoche</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-primary text-xl">
                        Es sind noch nicht genug Daten vorhanden
                    </p>
                </CardContent>
            </Card>
        );
    }

    const lastWeekCosts = calculateCosts(userData, lastWeekData);
    const thisWeekCosts = calculateCosts(userData, thisWeekData);
    const costDifference = thisWeekCosts - lastWeekCosts;
    const percentageChange = (costDifference / lastWeekCosts) * 100;

    const color = costDifference >= 0 ? "text-red-500" : "text-green-500";
    const sign = costDifference >= 0 ? "+" : "";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 7 Tage vs. Vorwoche</CardTitle>
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

export default EnergyCostsChangeLastSevenDays;
