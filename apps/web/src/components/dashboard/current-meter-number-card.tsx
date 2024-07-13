import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyLastEntry } from "@/query/energy";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    showDescription?: boolean;
}

export default async function CurrentMeterNumberCard(props: Props) {
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
                <CardTitle>Aktueller Zählerstand</CardTitle>
                {props.showDescription ? <CardDescription>Unabhängig vom Zeitraum</CardDescription> : null}
            </CardHeader>
            <CardContent className="text-center">
                <p
                    className={cn({
                        "font-medium": value !== undefined && value !== null,
                        "text-muted-foreground": value === undefined || value === null,
                    })}
                >
                    {!value ? "Keine Sensor Daten" : `${value.value.toFixed(0)} kWh`}
                </p>
            </CardContent>
        </Card>
    );
}
