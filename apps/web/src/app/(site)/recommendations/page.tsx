import { Suspense } from "react";
import AvgEnergyConsumptionCard from "@/components/recommendations/avg-energy-consumption-card";
import AvgEnergyConsumptionComparisonCard from "@/components/recommendations/avg-energy-consumption-comparison";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

export default function RecommendationsPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <Suspense fallback={<Skeleton className="h-52 w-full" />}>
                        <AvgEnergyConsumptionCard />
                    </Suspense>
                </div>
                <div>
                    <Suspense fallback={<Skeleton className="h-52 w-full" />}>
                        <AvgEnergyConsumptionComparisonCard />
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
