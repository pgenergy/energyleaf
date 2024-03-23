import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyDataForSensor } from "@/query/energy";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

interface EnergyDataItem {
    value: number;
}

const formatNumber = (number: number) => number.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function EnergyConsumptionStatisticCard({ startDate, endDate }: Props) {
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
                    <CardTitle>Verbrauchsstatistiken</CardTitle>
                    <CardDescription>Ihr Sensor konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h1 className="text-center text-2xl font-bold text-primary">Keine Sensoren gefunden</h1>
                </CardContent>
            </Card>
        );
    }

    const energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
    const energyValues = energyData.map((entry) => entry.value);

    const maxConsumptionEntry: EnergyDataItem = energyData.reduce(
        (prev, current) => (prev.value > current.value ? prev : current),
        { value: 0 },
    );
    const maxConsumption = maxConsumptionEntry.value || 0;

    const sumConsumption = energyValues.reduce((acc, cur) => acc + cur, 0);
    const averageConsumption = energyValues.length > 0 ? sumConsumption / energyValues.length : 0;

    const lastValue = energyValues.length > 0 ? energyValues[energyValues.length - 1] : null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Verbrauchsstatistiken</CardTitle>
                <CardDescription>
                    {startDate.toDateString() === endDate.toDateString() ?
                        format(startDate, "PPP", {locale: de}) :
                        `${format(startDate, "PPP", {locale: de})} - ${format(endDate, "PPP", {locale: de})}`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">Max.</h2>
                        <p className="text-center">{formatNumber(maxConsumption)} kWh</p>
                    </div>
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">⌀</h2>
                        <p className="text-center">{formatNumber(averageConsumption)} kWh</p>
                    </div>
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">Letzter</h2>
                        <p className="text-center">{formatNumber(lastValue ?? 0)} kWh</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
