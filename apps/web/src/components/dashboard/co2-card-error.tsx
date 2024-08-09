"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function CO2CardError() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    CO<sub>2</sub> Emissionen
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
