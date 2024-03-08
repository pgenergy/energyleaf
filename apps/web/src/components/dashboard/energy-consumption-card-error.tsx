"use client";

import type { FallbackProps } from "react-error-boundary";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import {TryAgainErrorHint} from "@energyleaf/ui/error";

export default function EnergyConsumptionError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verbrauch</CardTitle>
                <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
            </CardContent>
        </Card>
    );
}
