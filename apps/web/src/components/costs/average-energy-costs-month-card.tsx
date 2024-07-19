import { calculateAverageCostsPerMonth } from "@/lib/costs/average-costs-calculation";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function AverageEnergyCostsMonth({ userData, energyData }) {
    const averageCostsPerMonth = calculateAverageCostsPerMonth(energyData, userData);
    const formattedCost = formatNumber(averageCostsPerMonth);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Monat</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}
