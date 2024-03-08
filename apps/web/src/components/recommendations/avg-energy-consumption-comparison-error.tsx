"use client";

import type { FallbackProps } from "react-error-boundary";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import {TryAgainErrorHint} from "@energyleaf/ui/error";

export default function AvgEnergyConsumptionComparisonError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Im Vergleich zu anderen Nutzern mit vergleichbaren Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
            </CardContent>
        </Card>
    );
}
