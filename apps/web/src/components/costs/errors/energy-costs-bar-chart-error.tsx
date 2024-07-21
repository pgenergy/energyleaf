"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function EnergyCostsBarChartError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tägliche Energiekosten der letzten Tage</CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
