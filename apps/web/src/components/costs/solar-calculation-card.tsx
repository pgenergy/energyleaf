import { createHash } from "node:crypto";
import SolarCalculationForm from "@/components/costs/solar-calculator-form";
import { env } from "@/env.mjs";
import { getSession } from "@/lib/auth/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Skeleton } from "@energyleaf/ui/skeleton";
import React, { Suspense } from "react";

export default async function SolarCalculationCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const data = {
        userId: user.id,
        userHash: createHash("sha256").update(`${user.id}${env.HASH_SECRET}`).digest("hex"),
        endpoint:
            env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview"
                ? `https://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/solar`
                : `http://${env.NEXT_PUBLIC_ADMIN_URL}/api/v1/solar`,
    };

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
                    <SolarCalculationForm userId={data.userId} userHash={data.userHash} endpoint={data.endpoint} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
