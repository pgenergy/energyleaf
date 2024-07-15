import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getWeekComparison } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsComparativeProjectionWeek({ userData, energyData }) {

    const predictedCost = getWeekComparison(energyData, userData);
    const color = predictedCost.absoluteDifference <= 0 ? "text-red-500" : "text-green-500";
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich letzte Woche</CardTitle>
            </CardHeader>
            <CardContent>
                {predictedCost ? (
                    <p className={`text-center font-bold text-2xl ${color}`}>
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
