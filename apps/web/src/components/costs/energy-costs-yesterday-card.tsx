import { calculateCosts } from "@/components/dashboard/energy-cost";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

function EnergyCostsYesterday({ userData, energyDataRaw }) {
    if (!energyDataRaw || !userData) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten gestern</CardTitle>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Daten nicht verfügbar</h1>
                </CardContent>
            </Card>
        );
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    const yesterdaysData = energyDataRaw.filter(data => {
        const timestamp = new Date(data.timestamp);
        return timestamp >= startOfYesterday && timestamp < endOfYesterday;
    });

    const rawCosts = calculateCosts(userData, yesterdaysData);
    const cost = rawCosts.toFixed(2);
    const parsedCost = Number.parseFloat(cost);
    const formattedCost = formatNumber(parsedCost);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Energiekosten gestern</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}

export default EnergyCostsYesterday;
