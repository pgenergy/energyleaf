import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    sensorId: string | null;
    avg: number | null;
}

export default function AvgEnergyConsumptionCard({ sensorId, avg }: Props) {
    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Absoluter Energieverbrauch</CardTitle>
                    <CardDescription>Dein Sensor konnte nicht gefunden werden</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Dein durchschnittlicher Energieverbrauch</CardDescription>
            </CardHeader>
            <CardContent>
                {avg ? (
                    <h1 className="text-center text-2xl font-bold text-primary">{avg} Wh</h1>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
