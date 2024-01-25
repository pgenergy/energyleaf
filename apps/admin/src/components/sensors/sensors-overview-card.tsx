import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import React from "react";
import SensorsTable from "@/components/sensors/sensors-table";
import SensorAddButton from "@/components/sensors/sensor-add-button";
import {SensorContextProvider} from "@/hooks/sensor-hook";
import SensorAddDialog from "@/components/sensors/sensor-add-dialog";
import {SensorResetKeyDialog} from "@/components/sensors/sensor-reset-key-dialog";

export default function SensorsOverviewCard() {
    return (
        <SensorContextProvider>
            <SensorAddDialog/>
            <SensorResetKeyDialog/>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sensoren</CardTitle>
                    <CardDescription>Hier kannst du alle registrierten Sensoren einsehen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <SensorAddButton/>
                    </div>
                    <SensorsTable/>
                </CardContent>
            </Card>
        </SensorContextProvider>
    );
}
