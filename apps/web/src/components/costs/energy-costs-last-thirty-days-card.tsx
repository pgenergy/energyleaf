import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsLastThirtyDays({ userData, energyDataRaw }) {
    if (!energyDataRaw || !userData) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten letzte 30 Tage</CardTitle>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Daten nicht verfügbar</h1>
                </CardContent>
            </Card>
        );
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);

    const lastThirtyDaysData = energyDataRaw.filter((data) => {
        const timestamp = new Date(data.timestamp);
        return timestamp >= thirtyDaysAgo && timestamp < today;
    });

    const rawCosts = calculateCosts(userData, lastThirtyDaysData);
    const cost = rawCosts.toFixed(2);
    const parsedCost = Number.parseFloat(cost);
    const formattedCost = formatNumber(parsedCost);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten letzte 30 Tage</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}

export default EnergyCostsLastThirtyDays;
