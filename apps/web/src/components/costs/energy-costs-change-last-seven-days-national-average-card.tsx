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
                    <CardTitle>Energieverbrauch: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
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
                    <CardTitle>Energieverbrauch: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
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
                <CardTitle>Energieverbrauch: Letzte 7 Tage vs. Deutscher Durchschnitt</CardTitle>
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
function getNationalAverageCost(userData, days) {
    const { people, houseType = "apartment", hotWater = "not_electric" } = userData;

    const yearlyCosts = {
        house: {
            regular: [1015, 1265, 1520, 1690, 2110],
            withHotWater: [1140, 1480, 1900, 2155, 2660],
        },
        apartment: {
            regular: [590, 845, 1100, 1225, 1265],
            withHotWater: [720, 1180, 1520, 1775, 1900],
        },
    };

    if (people > 5) return null;

    const costArray = yearlyCosts[houseType]?.[hotWater === "electric" ? "withHotWater" : "regular"];
    if (!costArray) {
        console.error("Invalid houseType or hotWater settings", { houseType, hotWater });
        return null;
    }

    const annualCost = costArray[Math.min(people, costArray.length) - 1];
    return (annualCost / 365) * days;
}

export default EnergyCostsChangeLastSevenDaysNationalAverage;
