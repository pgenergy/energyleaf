import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getPredictedCostForDay } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsProjectionDay({ userData, energyData }) {
    
    const predictedCosts = getPredictedCostForDay(energyData, userData);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktueller Tag</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCosts ? (
                    <p className="text-center font-bold text-2xl text-primary">
                        {predictedCosts} €
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
