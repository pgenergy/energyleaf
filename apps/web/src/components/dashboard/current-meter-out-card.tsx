import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyLastEntry } from "@/query/energy";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    showDescription?: boolean;
};

export default async function CurrentMeterOutCard(props: Props) {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const sensorId = await getElectricitySensorIdForUser(user.id);
    if (!sensorId) {
        return null;
    }

    const value = await getEnergyLastEntry(sensorId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktuelle Eingespeiste Energie</CardTitle>
                {props.showDescription ? <CardDescription>Unabhängig vom Zeitraum</CardDescription> : null}
            </CardHeader>
            <CardContent className="text-center">
                <p
                    className={cn({
                        "font-medium": value?.valueOut !== null && value?.valueOut !== undefined,
                        "text-muted-foreground": value?.valueOut === null || value?.valueOut === undefined,
                    })}
                >
                    {!value?.valueOut ? "Keine Sensor Daten" : `${value.valueOut.toFixed(0)} kWh`}
                </p>
            </CardContent>
        </Card>
    );
}
