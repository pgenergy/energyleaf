import React, {Suspense} from "react";
import SensorAddButton from "@/components/sensors/sensor-add-button";
import SensorAddDialog from "@/components/sensors/sensor-add-dialog";
import { SensorDeleteDialog } from "@/components/sensors/sensor-delete-dialog";
import SensorsTable from "@/components/sensors/sensors-table";
import { SensorContextProvider } from "@/hooks/sensor-hook";

import {Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton} from "@energyleaf/ui";

import SensorEditDialog from "./sensor-edit-dialog";
import SensorsTableError from "@/components/sensors/table/sensors-table-error";
import {ErrorBoundary} from "@energyleaf/ui/error";

export default function SensorsOverviewCard() {
    return (
        <SensorContextProvider>
            <SensorAddDialog />
            <SensorDeleteDialog />
            <SensorEditDialog />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sensoren</CardTitle>
                    <CardDescription>Hier kannst du alle registrierten Sensoren einsehen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end">
                        <SensorAddButton />
                    </div>
                    <ErrorBoundary fallback={SensorsTableError}>
                        <Suspense fallback={<Skeleton className="h-96" />}>
                            <SensorsTable />
                        </Suspense>
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </SensorContextProvider>
    );
}
