"use client";

import ErrorCard from "@/components/error/error-card";
import UserConsumptionAggregationOption from "@/components/users/details/consumption/user-consumption-aggregation-option";
import UserConsumptionCardContent from "@/components/users/details/consumption/user-consumption-card-content";
import UserConsumptionDateRange from "@/components/users/details/consumption/user-consumption-date-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import React from "react";
import ConsumptionChartZoomReset from "./consumption-chart-zoom-reset";

interface Props {
    userId: string;
}

const cardTitle = "Verbrauch";

export default function UserConsumptionCard({ userId }: Props) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start">
                <div className="flex flex-col gap-2">
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>Hier können Sie den Verbrauch des Nutzers einsehen.</CardDescription>
                </div>
                <div className="flex flex-row gap-4">
                    <ConsumptionChartZoomReset />
                    <UserConsumptionDateRange />
                    <UserConsumptionAggregationOption />
                </div>
            </CardHeader>
            <CardContent>
                <UserConsumptionCardContent userId={userId} />
            </CardContent>
        </Card>
    );
}

export function UserConsumptionCardError() {
    return <ErrorCard title={cardTitle} />;
}
