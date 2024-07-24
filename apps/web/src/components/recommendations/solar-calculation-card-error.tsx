"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";
import React from "react";

export default function SolarCalculationCardError() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Balkonkraftwerk simulieren</CardTitle>
                <CardDescription>
                    Mit dem Balkonkraftwerk-Simulator können Sie bestimmen, wie viel Energie Ihre PV-Anlage erzeugt.
                    Geben Sie dazu die maximale Leistung der Anlage an.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
