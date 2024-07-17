import { getDayComparison } from "@/components/costs/energy-projection-calculation";
import InfoDialog from "@/components/costs/info-dialog-component";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";

export default function EnergyCostsComparativeProjectionDay({ userData, energyData }) {
    const predictedCost = getDayComparison(energyData, userData);
    const color = predictedCost.absoluteDifference <= 0 ? "text-red-500" : "text-green-500";
    return (
        <Card style={{ position: "relative" }}>
            <CardHeader>
                <CardTitle>Unterschied zu gestern</CardTitle>
            </CardHeader>
            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <InfoDialog description="Die Berechnung erfolgt basierend auf dem Stromverbrauch des aktuellen und letzten Tages in Euro und Prozent, wobei die Kosten für den Basispreis und den Arbeitspreis pro kWh berücksichtigt werden." />
            </div>
            <CardContent>
                {predictedCost ? (
                    <p className={`text-center font-bold text-2xl ${color}`}>
                        {predictedCost.absoluteDifference} €
                        <br />
                        {predictedCost.relativeDifference} %
                    </p>
                ) : (
                    <p>Keine Daten verfügbar.</p>
                )}
            </CardContent>
        </Card>
    );
}
