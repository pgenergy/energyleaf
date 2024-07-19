"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyCostsChangeLastSevenDaysError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiekosten: Letzte 7 Tage vs. Vorwoche</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
