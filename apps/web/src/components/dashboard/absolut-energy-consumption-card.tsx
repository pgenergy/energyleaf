import { getSession } from "@/lib/auth/auth.server";
import { formatNumber } from "@/lib/consumption/number-format";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { redirect } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function AbsolutEnergyConsumptionCard({ startDate, endDate }: Props) {
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
                    <CardTitle>Absoluter Energieverbrauch</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center font-bold text-2xl text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const absolut = energyData.reduce((acc, cur) => acc + cur.value, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Absoluter Energieverbrauch</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ? (
                        <>{format(startDate, "PPP", { locale: de })}</>
                    ) : (
                        <>
                            {format(startDate, "PPP", { locale: de })} - {format(endDate, "PPP", { locale: de })}
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <h1 className="text-center font-bold text-2xl text-primary">{formatNumber(absolut)} kWh</h1>
            </CardContent>
        </Card>
    );
}
