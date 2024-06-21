"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function AvgEnergyConsumptionError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>
                    Hier sehen Sie Ihren durchschnittlichen Energieverbrauch über die gesamte Zeit
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
