import { DeviceContextProvider } from "@/hooks/device-hook";
import { getSession } from "@/lib/auth/auth.server";
import { evaluatePowerEstimation } from "@/lib/devices/power-estimation";
import { getUserData } from "@/query/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";
import DeviceAddButton from "./device-add-button";
import { DeviceDeleteDialog } from "./device-delete-dialog";
import DeviceEditDialog from "./device-edit-dialog";
import DevicesBadPowerEstimationAlert from "./devices-bad-power-estimation-alert";
import DevicesTable from "./devices-table";
import DevicesTableError from "./table/devices-table-error";

export default async function DevicesOverviewCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    const estimationRSquared = userData?.devicePowerEstimationRSquared ?? null;
    const showEstimationBadge = estimationRSquared !== null && evaluatePowerEstimation(estimationRSquared) !== "well";

    return (
        <DeviceContextProvider>
            <DeviceEditDialog />
            <DeviceDeleteDialog />
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle>Ihre Geräte</CardTitle>
                        <CardDescription>
                            Hier sehen Sie alle Ihre Geräte und können diese verwalten.
                            <p className="text-sm text-muted-foreground mt-1">
                                Hinweis: Einige Standardgeräte wurden für Sie initial angelegt. Unsere KI kann diese Geräte
                                erkennen und überwachen. Falls Sie jedoch eines dieser Geräte nicht besitzen, können Sie es
                                problemlos löschen.
                            </p>
                        </CardDescription>
                    </div>
                    <DeviceAddButton />
                </CardHeader>
                <CardContent>
                    <ErrorBoundary fallback={DevicesTableError}>
                        <Suspense fallback={<Skeleton className="h-96" />}>
                            {showEstimationBadge && <DevicesBadPowerEstimationAlert className="mb-2" />}
                            <DevicesTable />
                        </Suspense>
                    </ErrorBoundary>
                </CardContent>
            </Card>
        </DeviceContextProvider>
    );
}
