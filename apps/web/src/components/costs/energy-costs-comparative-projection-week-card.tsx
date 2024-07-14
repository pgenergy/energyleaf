import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getWeekComparison } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsComparativeProjectionWeek({ userData, energyData }) {

    const predictedCost = getWeekComparison(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich der hochgerechneten Woche zu letzter Woche (absolut und relativ)</CardTitle>
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
