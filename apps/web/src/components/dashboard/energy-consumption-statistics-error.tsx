"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui";
import { TryAgainErrorHint } from "@energyleaf/ui/error";
import type { FallbackProps } from "react-error-boundary";

export default function EnergyConsumptionStatisticsError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verbrauchsstatistiken</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />
            </CardContent>
        </Card>
    );
}
