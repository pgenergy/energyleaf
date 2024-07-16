import { getSession } from "@/lib/auth/auth.server";
import { getElectricitySensorIdForUser, getEnergyLastEntry } from "@/query/energy";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    showDescription?: boolean;
}

export default async function CurrentMeterPowerCard(props: Props) {
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
                <CardTitle>Aktuelle Leistung</CardTitle>
                {props.showDescription ? <CardDescription>Unabhängig vom Zeitraum</CardDescription> : null}
            </CardHeader>
            <CardContent className="text-center">
                <p
                    className={cn({
                        "font-medium": value?.valueCurrent !== null && value?.valueCurrent !== undefined,
                        "text-muted-foreground": value?.valueCurrent === null || value?.valueCurrent === undefined,
                    })}
                >
                    {!value?.valueCurrent ? "Keine Sensordaten vorhanden" : `${value.valueCurrent.toFixed(0)} W`}
                </p>
            </CardContent>
        </Card>
    );
}
