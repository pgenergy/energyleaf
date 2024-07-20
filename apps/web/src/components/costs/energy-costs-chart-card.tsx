import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { CostChart } from "@energyleaf/ui/charts/costs-chart";

export default function CostChartCard({ energyDataRaw, userData }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Wie verhalten sich Ihre monatlichen Energiekosten gegenüber der Abschlagszahlung?</CardTitle>
                <CardDescription>Ab dem heutigen Tag bis Ende des Monats werden die Kosten basierend auf dem bisherigen Verbrauch hochgerechnet</CardDescription>
            </CardHeader>
            <CardContent>
                <CostChart
                    energyDataRaw={energyDataRaw}
                    userData={userData}
                />
            </CardContent>
        </Card>
    );
}
