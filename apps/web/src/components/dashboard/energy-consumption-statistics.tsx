import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getEnergyDataForUser } from "@/query/energy";
import { format } from "date-fns";
import de from "date-fns/locale/de";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function EnergyConsumptionStatisticCard({ startDate, endDate }: Props) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const energyData = await getEnergyDataForUser(startDate, endDate, session.user.id);
    const energyValues = energyData.map(entry => entry.value);

    const maxConsumptionEntry = energyData.reduce((prev, current) => (prev.value > current.value ? prev : current), {});
    const maxConsumption = maxConsumptionEntry.value;
    const maxConsumptionDate = maxConsumptionEntry.timestamp;
    
    const sumConsumption = energyValues.reduce((acc, cur) => acc + cur, 0);
    const averageConsumption = energyValues.length > 0 ? sumConsumption / energyValues.length : 0;

    const lastValue = energyValues.length > 0 ? energyValues[energyValues.length - 1] : null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Verbrauchsstatistiken</CardTitle>
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
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">Max.</h2>
                        {/* Das Datum wird hier im passenden Design angezeigt */}
                        {maxConsumptionDate && (
                            <p className="text-center text-xs text-muted-foreground">
                                {format(new Date(maxConsumptionDate), "dd.MM.yyyy HH:mm")} Uhr
                            </p>
                        )}
                        <p className="text-center">{maxConsumption} kWh</p>
                    </div>
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">⌀</h2>
                        <p className="text-center">{averageConsumption.toFixed(2)} kWh</p>
                    </div>
                    <div>
                        <h2 className="text-center text-xl font-semibold text-primary">Letzter</h2>
                        <p className="text-center">{lastValue} kWh</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}