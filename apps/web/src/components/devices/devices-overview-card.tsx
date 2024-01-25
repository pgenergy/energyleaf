import { Suspense } from "react";
import { DeviceContextProvider } from "@/hooks/device-hook";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import DeviceAddButton from "./device-add-button";
import { DeviceDeleteDialog } from "./device-delete-dialog";
import DeviceEditDialog from "./device-edit-dialog";
import DevicesTable from "./devices-table";

export default function DevicesOverviewCard() {
    return (
        <DeviceContextProvider>
            <DeviceEditDialog />
            <DeviceDeleteDialog />
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Deine Geräte</CardTitle>
                        <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
                    </div>
                    <DeviceAddButton />
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-96" />}>
                        <DevicesTable />
                    </Suspense>
                </CardContent>
            </Card>
        </DeviceContextProvider>
    );
}
