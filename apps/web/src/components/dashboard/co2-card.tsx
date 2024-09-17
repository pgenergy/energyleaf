import { getSession } from "@/lib/auth/auth.server";
import { calculateCO2eqEmissions } from "@/query/co2";
import { formatNumber } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Info } from "lucide-react";
import { redirect } from "next/navigation";

interface Props {
    startDate: Date;
    endDate: Date;
}

export default async function CO2Card({ startDate, endDate }: Props) {
    const { session, user } = await getSession();

    if (!session) {
        redirect("/");
    }

    const result = await calculateCO2eqEmissions(startDate.toISOString(), endDate.toISOString());
    if (!result.success || result.payload === undefined) {
        throw new Error(result.message);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-row items-center gap-2">
                    <CardTitle>
                        CO<sub>2</sub> Emissionen
                    </CardTitle>
                    <Popover>
                        <PopoverTrigger className="text-s">
                            <Info className="h-5 w-5" />
                        </PopoverTrigger>
                        <PopoverContent>
                            CO<sub>2</sub>-Äquivalente, kurz: CO<sub>2</sub>eq sind eine Maßeinheit, um die Klimawirkung
                            unterschiedlicher Treibhausgase zu vergleichen. Durch Ihren Energieverbrauch wurde diese
                            Menge CO<sub>2</sub>eq freigesetzt. Als Berechnungsgrundlage werden historische Daten aus
                            der Stromproduktion verwendet.
                        </PopoverContent>
                    </Popover>
                </div>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <h1 className="text-center font-bold font-mono">
                    {formatNumber(result.payload)} g CO<sub>2</sub>eq
                </h1>
            </CardContent>
        </Card>
    );
}
