import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import React from "react";
import GoalProgress, {GoalState} from "@/components/dashboard/goals/goal-progress";

export default function GoalsCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Ziele</CardTitle>
                <CardDescription>Hier sehen Sie Ihre Ziele für den aktuellen Monat.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-row">
                <GoalProgress goalName="Energieverbrauch" goalValue={100} currentValue={42} unit={"Wh"} state={GoalState.GOOD} />
                <GoalProgress goalName="Budget" goalValue={400} currentValue={320} unit={"€"} state={GoalState.IN_DANGER} />
                <GoalProgress goalName="Test" goalValue={320} currentValue={400} unit={"°"} state={GoalState.EXCEEDED} />
            </CardContent>
        </Card>
    );
}