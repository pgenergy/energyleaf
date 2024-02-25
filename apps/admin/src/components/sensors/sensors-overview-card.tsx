import React from "react";
import SensorAddButton from "@/components/sensors/sensor-add-button";
import SensorAddDialog from "@/components/sensors/sensor-add-dialog";
import { SensorDeleteDialog } from "@/components/sensors/sensor-delete-dialog";
import SensorsTable from "@/components/sensors/sensors-table";
import { SensorContextProvider } from "@/hooks/sensor-hook";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function SensorsOverviewCard() {
    return (
        <SensorContextProvider>
            <SensorAddDialog />
            <SensorDeleteDialog />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sensoren</CardTitle>
                    <CardDescription>Hier kannst du alle registrierten Sensoren einsehen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <SensorAddButton />
                    </div>
                    <SensorsTable />
                </CardContent>
            </Card>
        </SensorContextProvider>
    );
}
