import GoalProgress from "@/components/dashboard/goals/goal-progress";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser } from "@/query/energy";
import { getGoalStatus } from "@/query/goals";
import type { GoalStatus } from "@/types/goals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { ArrowRightIcon, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export default async function GoalsCard() {
    const { session, user } = await getSession();
    if (!session) {
        redirect("/");
    }

    const userId = user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);
    if (!sensorId) {
        return (
            <Card className="col-span-1 w-full md:col-span-3">
                <CardHeader>
                    <CardTitle>Ziele</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const goals = await getGoalStatus(userId, sensorId);

    return (
        <Card className="col-span-1 w-full md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Ziele</CardTitle>
                    <CardDescription>Hier sehen Sie Ihr aktuelles Verbrauchsziel.</CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger>
                        <Info className="h-7 w-7" />
                    </PopoverTrigger>
                    <PopoverContent>
                        Hier sehen Sie Ihren Energieverbrauch pro Tag/Woche/Monat (oben) im Verhältnis zu Ihrem
                        Verbrauchsziel im jeweiligen Zeitraum (unten). Sie können Ihr Verbrauchsziel in den
                        Einstellungen ändern.
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                {goals.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {goals.map((goal: GoalStatus) => (
                            <GoalProgress goal={goal} key={goal.goalName} />
                        ))}
                    </div>
                ) : (
                    <Link
                        className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                        href="/settings/goals"
                    >
                        Ziel in den Einstellungen festlegen
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
