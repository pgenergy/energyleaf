"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyCostsLastThirtyDaysError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten letzte 30 Tage</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}