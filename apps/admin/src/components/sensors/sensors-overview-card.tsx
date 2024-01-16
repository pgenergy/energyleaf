import { createSensor } from "@/actions/sensors";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { Plus } from "lucide-react";

export default async function SensorsOverviewCard() {
    await createSensor();
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sensoren</CardTitle>
                <CardDescription>Hier kannst du alle registrierten Sensoren einsehen.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end">
                    <Button>
                        <Plus className="mr-2" />
                        Sensor registrieren
                    </Button>
                </div>
                <p>TODO: Tabelle</p>
            </CardContent>
        </Card>
    );
}