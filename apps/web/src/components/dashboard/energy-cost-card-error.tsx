"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui";

export default function EnergyCostError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten</CardTitle>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
