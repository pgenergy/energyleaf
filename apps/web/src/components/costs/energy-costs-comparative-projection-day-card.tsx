import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { getDayComparison } from "@/components/costs/energy-projection-calculation";

export default function EnergyCostsComparativeProjectionDay({ userData, energyData }) {

    const predictedCost = getDayComparison(energyData, userData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich des hochgerechneten Tag zu letztem Tag (absolut und relativ)</CardTitle>
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
