import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForUser } from "@/query/energy";
import { differenceInMinutes } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

import DashboardDateRange from "./date-range";
import EnergyConsumptionCardChart from "./energy-consumption-card-chart";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function EnergyConsumptionCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const energyData = await getEnergyDataForUser(startDate, endDate, session.user.id);
    const data = energyData.map((entry) => ({
        energy: entry.value,
        timestamp: entry.timestamp.toString(),
    }));
    const mean = data.reduce((acc, cur) => acc + cur.energy, 0) / data.length;
    const std = Math.sqrt(
        data.map((x) => Math.pow(x.energy - mean, 2)).reduce((acc, cur) => acc + cur, 0) / data.length,
    );
    const threshold = mean + 2 * std;
    const peaks = data
        .filter((x) => x.energy > threshold)
        .filter((x, i, arr) => {
            if (i === 0) {
                return true;
            }

            return differenceInMinutes(new Date(x.timestamp), new Date(arr[i - 1].timestamp)) > 60;
        });

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht deines Verbrauchs im Zeitraum</CardDescription>
                </div>
                <DashboardDateRange endDate={endDate} startDate={startDate} />
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center">
                            <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                        </div>
                    ) : (
                        <EnergyConsumptionCardChart data={data} peaks={peaks} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
