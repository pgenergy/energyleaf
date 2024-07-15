import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getDayComparison } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsComparativeProjectionDay({ userData, energyData }) {

    const predictedCost = getDayComparison(energyData, userData);
    const color = predictedCost.absoluteDifference <= 0 ? "text-red-500" : "text-green-500";
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich zu gestern</CardTitle>
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
