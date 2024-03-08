import { Suspense } from "react";
import { DeviceContextProvider } from "@/hooks/device-hook";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import { ErrorBoundary } from "@energyleaf/ui/error";
import DeviceAddButton from "./device-add-button";
import { DeviceDeleteDialog } from "./device-delete-dialog";
import DeviceEditDialog from "./device-edit-dialog";
import DevicesTable from "./devices-table";
import DevicesTableError from "./table/devices-table-error";

export default function DevicesOverviewCard() {
    return (
        <DeviceContextProvider>
            <DeviceEditDialog />
            <DeviceDeleteDialog />
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Ihre Geräte</CardTitle>
                        <CardDescription>Hier sehen Sie alle Ihre Geräte und können diese verwalten.</CardDescription>
                    </div>
                    <DeviceAddButton />
                </CardHeader>
                <CardContent>
                    <ErrorBoundary fallback={DevicesTableError}>
                        <Suspense fallback={<Skeleton className="h-96" />}>
                            <DevicesTable />
                        </Suspense>
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </DeviceContextProvider>
    );
}
