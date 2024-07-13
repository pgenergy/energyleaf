import { calculateAverageCostsPerDay } from "@/components/costs/average-costs-calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function AverageEnergyCostsDay({ userData, energyData }) {
    const averageCostsPerDay = calculateAverageCostsPerDay(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Tag</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{averageCostsPerDay.toFixed(2)} €</p>
            </CardContent>
        </Card>
    );
}
