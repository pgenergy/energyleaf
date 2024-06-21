"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function AbsolutEnergyConsumptionError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Absoluter Energieverbrauch</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
