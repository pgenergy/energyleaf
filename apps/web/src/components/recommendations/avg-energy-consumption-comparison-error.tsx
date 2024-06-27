"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function AvgEnergyConsumptionComparisonError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vergleich des Energieverbrauchs</CardTitle>
                <CardDescription>
                    Hier sehen Sie Ihren durchschnittlichen Energieverbrauch im Vergleich zu anderen Nutzern
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
