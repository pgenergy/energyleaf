import { calculateAverageCostsPerWeek } from "@/lib/costs/average-costs-calculation";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function AverageEnergyCostsWeek({ userData, energyData }) {
    const averageCostsPerWeek = calculateAverageCostsPerWeek(energyData, userData);
    const formattedCost = formatNumber(averageCostsPerWeek);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Woche</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}
