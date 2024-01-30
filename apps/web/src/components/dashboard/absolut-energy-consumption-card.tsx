import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function AbsolutEnergyConsumptionCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);

    if (!sensorId) {
        throw new Error("Kein Stromsensor für diesen Benutzer gefunden");
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
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
