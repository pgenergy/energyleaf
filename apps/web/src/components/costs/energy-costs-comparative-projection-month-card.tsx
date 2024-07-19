import { getMonthComparison } from "@/lib/costs/energy-projection-calculation";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsComparativeProjectionMonth({ userData, energyData }) {
    const predictedCost = getMonthComparison(energyData, userData);
    const color = predictedCost.absoluteDifference <= 0 ? "text-red-500" : "text-green-500";
    return (
        <Card>
            <CardHeader>
                <CardTitle>Unterschied letzter Monat </CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCost ? (
                    <p className={`text-center font-bold text-2xl ${color}`}>
                        {formatNumber(predictedCost.absoluteDifference)} €
                        <br />
                        {formatNumber(predictedCost.relativeDifference)} %
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
