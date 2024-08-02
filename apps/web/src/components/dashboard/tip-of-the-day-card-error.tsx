"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { TryAgainErrorHint } from "@energyleaf/ui/error";
import { LightbulbIcon } from "lucide-react";

export default function TipOfTheDayCardError() {
    return (
        <Card className="col-span-1 w-full md:col-span-3">
            <CardHeader>
                <CardTitle className="flex flex-row gap-1">
                    Energiespartipp des Tages <LightbulbIcon className="text-primary" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TryAgainErrorHint />
            </CardContent>
        </Card>
    );
}
