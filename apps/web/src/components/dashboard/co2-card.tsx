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
    if (!result.success || !result.payload) {
        throw new Error(result.message);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    CO<sub>2</sub> Emissionen
                </CardTitle>
                <CardDescription>Im ausgewählten Zeitraum</CardDescription>
            </CardHeader>
            <CardContent>
                <h1 className="text-center font-bold text-2xl">
                    <span className="text-primary">
                        {formatNumber(result.payload)} g CO<sub>2</sub>eq
                    </span>
                    <Popover>
                        <PopoverTrigger className="text-s">
                            <Info className="ml-2 h-6 w-6" />
                        </PopoverTrigger>
                        <PopoverContent>
                            CO<sub>2</sub>-Äquivalente, kurz: CO<sub>2</sub>eq sind eine Masseinheit, um die
                            Klimawirkung unterschiedlicher Treibhausgase zu vergleichen. Durch Ihren Energieverbrauch
                            wurde diese Menge CO<sub>2</sub>eq freigesetzt. Als Berechnungsgrundlage werden historische
                            Daten aus der Stromproduktion verwendet.
                        </PopoverContent>
                    </Popover>
                </h1>
            </CardContent>
        </Card>
    );
}
