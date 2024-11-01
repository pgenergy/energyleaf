import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser } from "@/query/energy";
import { getDailyGoalStatus } from "@/query/goals";
import { Button, buttonVariants } from "@energyleaf/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Progress } from "@energyleaf/ui/progress";
import { ArrowRightIcon, Info, SettingsIcon } from "lucide-react";
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
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Tagesziel</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-bold font-mono">Keine Sensoren gefunden</p>
                </CardContent>
            </Card>
        );
    }

    const dailyGoal = await getDailyGoalStatus(userId, sensorId);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex w-full flex-row items-center justify-between gap-4">
                    Tagesziel
                    <div className="flex flex-row items-center gap-2">
                        <Link className={buttonVariants({ variant: "ghost", size: "icon" })} href="/settings/goals">
                            <SettingsIcon className="h-5 w-5" />
                        </Link>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                Hier sehen Sie Ihren Energieverbrauch an diesem Tag im Verhältnis zu Ihrem
                                Verbrauchsziel an diesem Tag. Sie können Ihr Verbrauchsziel in den Einstellungen ändern.
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-center gap-4">
                {dailyGoal ? (
                    <>
                        <Progress value={dailyGoal.progress} className="w-[50%]" />
                        <p className="font-bold font-mono">
                            {dailyGoal.currentValue} / {dailyGoal.goalValue} kWh
                        </p>
                    </>
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
