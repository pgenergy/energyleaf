"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { TryAgainErrorHint } from "@energyleaf/ui/error";
import type { FallbackProps } from "react-error-boundary";

export default function AvgEnergyConsumptionComparisonError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich des Energieverbrauchs</CardTitle>
                <CardDescription>
                    Hier sehen Sie Ihren durchschnittlichen Energieverbrauch im Vergleich zu anderen Nutzern
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />
            </CardContent>
        </Card>
    );
}
