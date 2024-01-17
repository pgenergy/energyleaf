import { Suspense } from "react";
import { PlusIcon } from "lucide-react";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import DevicesTable from "./devices-table";

export default function DevicesOverviewCard() {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Deine Geräte</CardTitle>
                    <CardDescription>Hier siehst du alle deine Geräte und kannst diese verwalten.</CardDescription>
                </div>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Gerät hinzufügen
                </Button>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-96" />}>
                    <DevicesTable />
                </Suspense>
            </CardContent>
        </Card>
    );
}
