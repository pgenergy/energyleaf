"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function EnergyConsumptionError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verbrauch</CardTitle>
                <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
