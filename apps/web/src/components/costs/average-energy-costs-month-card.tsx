import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { calculateAverageCostsPerMonth } from '@/components/costs/average-costs-calculation'; 

export default function AverageEnergyCostsMonth({ userData, energyData }) {
    
    const averageCostsPerMonth = calculateAverageCostsPerMonth(energyData, userData);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittliche Energiekosten pro Monat</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{averageCostsPerMonth.toFixed(2)} €</p>
            </CardContent>
        </Card>
    );
}
