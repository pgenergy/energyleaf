import { getNationalAverageCost } from "@/components/costs/get-national-average-cost";
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

function EnergyCostsChangeLastWeekNationalAverage({ userData, energyData }) {
    const { startOfLastWeek, endOfLastWeek } = getPreviousWeekDates();

    const thisWeekData = energyData.filter((data) => {
        const date = new Date(data.timestamp);
        return date >= startOfLastWeek && date < endOfLastWeek;
    });

    if (thisWeekData.length < 7) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energiekosten: Letzte Woche vs. Deutscher Durchschnitt</CardTitle>
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
                    <CardTitle>Energiekosten: Letzte Woche vs. Deutscher Durchschnitt</CardTitle>
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
                <CardTitle>Energiekosten: Letzte Woche vs. Deutscher Durchschnitt</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={"text-center font-bold text-xl"}>Kosten letzte Woche: {formatNumber(thisWeekCosts)} €</p>
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

export default EnergyCostsChangeLastWeekNationalAverage;
