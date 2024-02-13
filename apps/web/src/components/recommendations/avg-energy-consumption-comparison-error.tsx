"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function AvgEnergyConsumptionComparisonError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Im Vergleich zu anderen Nutzern mit vergleichbaren Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
