import { calculateAverageCostsPerDay } from "@/components/costs/average-costs-calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { formatNumber } from "@energyleaf/lib";

export default function AverageEnergyCostsDay({ userData, energyData }) {
    const averageCostsPerDay = calculateAverageCostsPerDay(energyData, userData);
    const formattedCost = formatNumber(averageCostsPerDay);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Tag</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center font-bold text-2xl text-primary">{formattedCost} €</p>
            </CardContent>
        </Card>
    );
}
