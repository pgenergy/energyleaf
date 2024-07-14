import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getMonthComparison } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsComparativeProjectionMonth({ userData, energyData }) {
    
    const predictedCost = getMonthComparison(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich des hochgerechneten Monat zu letztem Monat (absolut und relativ)</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCost ? (
                    <p className="text-center font-bold text-2xl text-primary">
                        {predictedCost.absoluteDifference} € <br></br>
                        {predictedCost.relativeDifference} %
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
