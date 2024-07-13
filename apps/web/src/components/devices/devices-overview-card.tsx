import { DeviceContextProvider } from "@/hooks/device-hook";
import { getActionSession } from "@/lib/auth/auth.action";
import { getUserData } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";
import DeviceAddButton from "./device-add-button";
import { DeviceDeleteDialog } from "./device-delete-dialog";
import DeviceEditDialog from "./device-edit-dialog";
import DevicesBadPowerEstimationHint from "./devices-bad-power-estimation-hint";
import DevicesTable from "./devices-table";
import DevicesTableError from "./table/devices-table-error";

export default async function DevicesOverviewCard() {
    const { user } = await getActionSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    const estimationRSquared = userData?.devicePowerEstimationRSquared ?? null;
    const showEstimationBadge = estimationRSquared !== null && estimationRSquared < 0.8;

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
                            {showEstimationBadge && <DevicesBadPowerEstimationHint />}
                            <DevicesTable />
                        </Suspense>
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </DeviceContextProvider>
    );
}
