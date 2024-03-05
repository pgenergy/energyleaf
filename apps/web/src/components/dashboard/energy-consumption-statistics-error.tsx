"use client";

import type { FallbackProps } from "react-error-boundary";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui";
import {TryAgainErrorHint} from "@energyleaf/ui/error";

export default function EnergyConsumptionStatisticsError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verbrauchsstatistiken</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
            </CardContent>
        </Card>
    );
}
