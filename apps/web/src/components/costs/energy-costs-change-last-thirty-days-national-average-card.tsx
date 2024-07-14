import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsChangeLastThirtyDaysNationalAverage({ userData, energyData }) {
    const now = new Date();
    const lastThirtyDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const thisMonthData = energyData.filter(data => {
        const date = new Date(data.timestamp);
        return date >= lastThirtyDays && date < now;
    });

    if (thisMonthData.length < 30) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energieverbrauch: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-xl text-primary">Es sind noch nicht genug Daten vorhanden</p>
                </CardContent>
            </Card>
        );
    }

    const nationalAverageCost = getNationalAverageCost(userData, 30);
    if (nationalAverageCost === null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Energieverbrauch: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold text-xl text-primary">Es sind keine Daten für den Vergleich verfügbar</p>
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
                <CardTitle>Energieverbrauch: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={`text-center font-bold text-2xl ${color}`}>{sign}{formatNumber(costDifference)} € ({sign}{formatNumber(percentageChange)}%)</p>
            </CardContent>
        </Card>
    );
}

function getNationalAverageCost(userData, days) {
    const { people, houseType = 'apartment', hotWater = 'not_electric' } = userData;

    const yearlyCosts = {
        house: {
            regular: [1015, 1265, 1520, 1690, 2110],
            withHotWater: [1140, 1480, 1900, 2155, 2660]
        },
        apartment: {
            regular: [590, 845, 1100, 1225, 1265],
            withHotWater: [720, 1180, 1520, 1775, 1900]
        }
    };

    if (people > 5) return null;

    const costArray = yearlyCosts[houseType]?.[hotWater === "electric" ? "withHotWater" : "regular"];
    if (!costArray) {
        return null;
    }

    const annualCost = costArray[Math.min(people, costArray.length) - 1];
    return (annualCost / 365) * days;
}

export default EnergyCostsChangeLastThirtyDaysNationalAverage;
