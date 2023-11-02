import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getAvgEnergyConsumptionForUser, getAvgEnergyConsumptionForUserInComparison } from "@/query/energy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default async function AvgEnergyConsumptionComparisonCard() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const avg = await getAvgEnergyConsumptionForUserInComparison(session.user.id);
    const avgUser = await getAvgEnergyConsumptionForUser(session.user.id);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                <CardDescription>Im Vergleich zu anderen Nutzern mit Vergleichbaren Daten</CardDescription>
            </CardHeader>
            <CardContent>
                {avg && avgUser ? (
                    <p className="text-center text-2xl text-primary">
                        <span className="font-bold">Durchschnitt: </span>
                        {avg.avg} Wh
                    </p>
                ) : (
                    <p className="text-center text-muted-foreground">Keine Daten vorhanden</p>
                )}
            </CardContent>
        </Card>
    );
}
