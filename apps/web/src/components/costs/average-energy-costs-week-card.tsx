import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { calculateAverageCostsPerWeek } from '@/components/costs/average-costs-calculation'; 

export default function AverageEnergyCostsWeek({ userData, energyData }) {

    const averageCostsPerWeek = calculateAverageCostsPerWeek(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Woche</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{averageCostsPerWeek.toFixed(2)} €</p>
            </CardContent>
        </Card>
    );
}
