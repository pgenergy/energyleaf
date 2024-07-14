import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getPredictedCostForDay } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsProjectionDay({ userData, energyData }) {
    
    const predictedCost = getPredictedCostForDay(energyData, userData);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hochrechnung des aktuellen Tages</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCost ? (
                    <p className="text-center font-bold text-2xl text-primary">
                        {predictedCost} €
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
