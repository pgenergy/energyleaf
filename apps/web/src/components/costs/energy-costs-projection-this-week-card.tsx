import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getPredictedCostForWeek } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsProjectionWeek({ userData, energyData }) {
    const predictedCosts = getPredictedCostForWeek(energyData, userData)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hochrechnung der aktuellen Woche</CardTitle>
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
