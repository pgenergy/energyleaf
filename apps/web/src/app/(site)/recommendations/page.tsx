import { Suspense } from "react";
import { redirect } from "next/navigation";
import AvgEnergyConsumptionComparisonComponent from "@/components/recommendations/avg-energy-consumption-comparison-component";
import AvgEnergyConsumptionComponent from "@/components/recommendations/avg-energy-consumption-component";
import { getSession } from "@/lib/auth/auth";
import {
    getAvgEnergyConsumptionForSensor,
    getAvgEnergyConsumptionForUserInComparison,
    getElectricitySensorIdForUser,
} from "@/query/energy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

export default async function RecommendationsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const sensorId = await getElectricitySensorIdForUser(session.user.id);
    let usersAvg: {
        avg: number;
        count: number;
    } | null = null;
    let ownAvg: number | null = null;
    if (sensorId) {
        usersAvg = await getAvgEnergyConsumptionForUserInComparison(session.user.id);
        ownAvg = await getAvgEnergyConsumptionForSensor(sensorId);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <Suspense fallback={<Skeleton className="h-52 w-full" />}>
                        <AvgEnergyConsumptionComponent avg={ownAvg} sensorId={sensorId} />
                    </Suspense>
                </div>
                <div>
                    <Suspense fallback={<Skeleton className="h-52 w-full" />}>
                        <AvgEnergyConsumptionComparisonComponent avg={usersAvg} avgUser={ownAvg} sensorId={sensorId} />
                    </Suspense>
                </div>
            </div>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Deine Geräte</CardTitle>
                    <CardDescription>Hier siehst du den Verbauch deiner Geräte</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-center">
                        <p className="text-muted-foreground">Noch keine Geräte vorhanden</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
