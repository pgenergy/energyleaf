import { getPredictedCostForWeek } from "@/lib/costs/energy-projection-calculation";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsProjectionWeek({ userData, energyData }) {
    const predictedCosts = getPredictedCostForWeek(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktuelle Woche</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCosts ? (
                    <p className="text-center font-bold text-2xl text-primary">
                        {formatNumber(predictedCosts)} € <br />
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
