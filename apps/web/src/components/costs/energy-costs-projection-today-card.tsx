import { getPredictedCostForDay } from "@/lib/costs/energy-projection-calculation";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsProjectionDay({ userData, energyData }) {
    const predictedCosts = getPredictedCostForDay(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktueller Tag</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCosts ? (
                    <p className="text-center font-bold text-2xl text-primary">{formatNumber(predictedCosts)} €</p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
