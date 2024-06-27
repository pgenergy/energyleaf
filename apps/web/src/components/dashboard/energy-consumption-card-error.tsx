"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyConsumptionError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verbrauch</CardTitle>
                <CardDescription>Übersicht Ihres Verbrauchs im Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
