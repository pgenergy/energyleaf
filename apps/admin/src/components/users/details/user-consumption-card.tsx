import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UserConsumptionCardContent from "@/components/users/details/user-consumption-card-content";
import React from "react";
import UserConsumptionDateRange from "@/components/users/details/user-consumption-date-range";
import {useUserDetailsContext} from "@/hooks/user-detail-hook";
import UserConsumptionAggregationOption from "@/components/users/details/user-consumption-aggregation-option";

interface Props {
    userId: number;
}

export default function UserConsumptionCard({ userId }: Props) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col justify-start md:flex-row md:justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Hier kannst du den Verbrauch des Nutzers einsehen.</CardDescription>
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