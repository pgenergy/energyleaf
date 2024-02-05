import {Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton} from "@energyleaf/ui";
import React, {Suspense} from "react";
import AvgEnergyConsumptionCard from "@/components/recommendations/avg-energy-consumption-card";
import AvgEnergyConsumptionComparisonCard from "@/components/recommendations/avg-energy-consumption-comparison";


export default function ReportPage() {
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Fällige User für Daily-Mail</CardTitle>
                    <CardDescription>Hier siehst du den Verbauch deiner Geräte</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-center">
                        <p className="text-muted-foreground">Noch keine Geräte vorhanden</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}