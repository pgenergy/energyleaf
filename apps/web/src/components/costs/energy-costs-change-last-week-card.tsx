import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function getPreviousWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const endOfLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const startOfLastWeek = new Date(
        endOfLastWeek.getFullYear(),
        endOfLastWeek.getMonth(),
        endOfLastWeek.getDate() - 6,
    );
    return { startOfLastWeek, endOfLastWeek };
}

function EnergyCostsChangeLastWeek({ userData, energyData }) {
    const { startOfLastWeek, endOfLastWeek } = getPreviousWeekDates();
    const startOfPreviousWeek = new Date(
        startOfLastWeek.getFullYear(),
        startOfLastWeek.getMonth(),
        startOfLastWeek.getDate() - 7,
    );

    const lastWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfPreviousWeek && date < startOfLastWeek;
    });
    const thisWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfLastWeek && date < endOfLastWeek;
    });

    if (lastWeekData.length < 7 || thisWeekData.length < 7) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte Woche vs. Vorwoche</CardTitle>
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
                <CardTitle>Energiekosten: Letzte Woche vs. Vorwoche</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={"text-center font-bold text-xl"}>Kosten letzte Woche: {formatNumber(thisWeekCosts)} €</p>
                <p className={`text-center font-bold text-2xl ${color}`}>
                    {sign}
                    {formatNumber(costDifference)} € ({sign}
                    {formatNumber(percentageChange)}%)
                </p>
            </CardContent>
        </Card>
    );
}

export default EnergyCostsChangeLastWeek;
