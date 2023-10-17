import { redirect } from "next/navigation";
import { getSessionOnServer } from "@/lib/auth/auth";
import { getEnergyDataForUser } from "@/query/energy";
import { format } from "date-fns";
import de from "date-fns/locale/de";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function AbsolutEnergyConsumptionCard({ startDate, endDate }: Props) {
    const session = await getSessionOnServer();

    if (!session) {
        redirect("/");
    }

    const energyData = await getEnergyDataForUser(startDate, endDate, session.user.id);
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Absoluter Energieverbrauch</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ? (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    ) : (
                        <>
                            {format(startDate, "PPP", {
                                locale: de,
                            })}{" "}
                            -{" "}
                            {format(endDate, "PPP", {
                                locale: de,
                            })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <h1 className="text-center text-2xl font-bold text-primary">{absolut} Wh</h1>
            </CardContent>
        </Card>
    );
}
