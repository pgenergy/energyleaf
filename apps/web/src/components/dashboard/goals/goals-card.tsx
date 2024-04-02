import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import React from "react";
import GoalProgress from "@/components/dashboard/goals/goal-progress";
import { getSession } from "@/lib/auth/auth.server";
import {redirect} from "next/navigation";
import {ArrowRightIcon} from "lucide-react";
import Link from "next/link";
import {getElectricitySensorIdForUser} from "@/query/energy";
import type {Goal} from "@/types/goals";
import { getGoals } from "@/query/goals";

export default async function GoalsCard() {
    const {session, user} = await getSession();
    if (!session) {
        redirect("/");
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);
    if (!sensorId) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Ziele</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const goals = await getGoals(userId, sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Ziele</CardTitle>
                <CardDescription>Hier sehen Sie Ihr aktuelles Verbrauchsziel.</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    goals.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {
                                goals.map((goal: Goal) => (
                                        <GoalProgress key={goal.goalName}
                                                      goalName={goal.goalName}
                                                      goalValue={goal.goalValue}
                                                      currentValue={goal.currentValue}
                                                      state={goal.state}
                                        />
                                    )
                                )
                            }
                        </div>
                    ) : (
                        <Link
                            className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground"
                            href="/profile"
                        >
                            Ziel im Profil festlegen
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    )
                }
            </CardContent>
        </Card>
    );
}