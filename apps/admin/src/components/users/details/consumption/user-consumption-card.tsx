"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UserConsumptionCardContent from "@/components/users/details/consumption/user-consumption-card-content";
import React from "react";
import UserConsumptionDateRange from "@/components/users/details/consumption/user-consumption-date-range";
import UserConsumptionAggregationOption from "@/components/users/details/consumption/user-consumption-aggregation-option";
import type {FallbackProps} from "react-error-boundary";
import ErrorCard from "@/components/error/error-card";

interface Props {
    userId: string;
}

const cardTitle = "Verbrauch";

export default function UserConsumptionCard({ userId }: Props) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start md:flex-row md:justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>Hier können Sie den Verbrauch des Nutzers einsehen.</CardDescription>
                </div>
                <div className="flex flex-row gap-4">
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

export function UserConsumptionCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard resetErrorBoundary={resetErrorBoundary} title={cardTitle} />;
}