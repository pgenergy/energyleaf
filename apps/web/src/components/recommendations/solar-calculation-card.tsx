import SolarCalculationForm from "@/components/recommendations/solar-calculation-form";
import { getSession } from "@/lib/auth/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Skeleton } from "@energyleaf/ui/skeleton";
import React, { Suspense } from "react";

export default async function SolarCalculationCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Balkonkraftwerk simulieren</CardTitle>
                <CardDescription>
                    Mit dem Balkonkraftwerk-Simulator können Sie bestimmen, wie viel Energie Ihre PV-Anlage erzeugt.
                    Geben Sie dazu die maximale Leistung der Anlage an.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <SolarCalculationForm userId={user.id} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
