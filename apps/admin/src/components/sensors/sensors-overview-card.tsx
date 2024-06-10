import SensorAddButton from "@/components/sensors/sensor-add-button";
import SensorAddDialog from "@/components/sensors/sensor-add-dialog";
import { SensorDeleteDialog } from "@/components/sensors/sensor-delete-dialog";
import SensorsTable from "@/components/sensors/sensors-table";
import SensorsTableError from "@/components/sensors/table/sensors-table-error";
import { SensorContextProvider } from "@/hooks/sensor-hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { ErrorBoundary } from "@energyleaf/ui/error";
import React, { Suspense } from "react";
import SensorAddValueDialog from "./sensor-add-value-dialog";
import SensorEditDialog from "./sensor-edit-dialog";
import SensorResetAlert from "./sensor-reset-alert";

export default function SensorsOverviewCard() {
    return (
        <SensorContextProvider>
            <SensorAddDialog />
            <SensorDeleteDialog />
            <SensorEditDialog />
            <SensorAddValueDialog />
            <SensorResetAlert />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Sensoren</CardTitle>
                    <CardDescription>Hier können Sie alle registrierten Sensoren einsehen.</CardDescription>
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
