import {Plus} from "lucide-react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import React from "react";
import SensorsTable from "@/components/sensors/sensors-table";

export default function SensorsOverviewCard() {
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
                <SensorsTable/>
            </CardContent>
        </Card>
    );
}
