"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyCostsChangeLastThirtyDaysNationalAverageError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 30 Tage vs. Deutscher Durchschnitt</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
