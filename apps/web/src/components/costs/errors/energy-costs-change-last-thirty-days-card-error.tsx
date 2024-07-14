"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyCostsChangeLastThirtyDaysError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 30 Tage vs. Vormonat</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}