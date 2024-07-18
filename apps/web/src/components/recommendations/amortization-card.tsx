import { DeviceCategory, type DeviceSelectType, SensorType, SensorTypeMap } from "@energyleaf/db/types";
import { cn } from "@energyleaf/tailwindcss/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { Command, CommandItem, CommandList } from "@energyleaf/ui/command";
import { CheckIcon } from "lucide-react";
import AmortizationSelect from "./amortization-select";

export default async function AmortizationCard() {
    const devices: DeviceSelectType[] = [
        {
            category: DeviceCategory.AirConditioning,
            id: 1,
            name: "Klimaanlage",
            created: new Date(),
            powerEstimation: 10000,
            timestamp: new Date(),
            userId: "1",
        },
        {
            category: DeviceCategory.ECar,
            id: 2,
            name: "E-Auto Ladestation",
            created: new Date(),
            powerEstimation: 20000,
            timestamp: new Date(),
            userId: "1",
        },
        {
            category: DeviceCategory.HairDryer,
            id: 3,
            name: "Haartrockner",
            created: new Date(),
            powerEstimation: 5000,
            timestamp: new Date(),
            userId: "1",
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Geräte-Amortisation</CardTitle>
                <CardDescription>
                    Hier können Sie prüfen, nach welcher Zeit sich die Anschaffung eines neuen Gerätes rentiert hat.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3 md:grid-rows-1">
                <AmortizationSelect devices={devices} />
                <div className="flex flex-col gap-4 md:col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Cent pro kWh</h2>
                            <p className="text-center">2 ct</p>
                        </div>
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Euro pro Jahr</h2>
                            <p className="text-center">3 €</p>
                        </div>
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Amortisationszeit</h2>
                            <p className="text-center">2 Jahre</p>
                        </div>
                    </div>
                    <AmortizationChart />
                </div>
            </CardContent>
        </Card>
    );
}
