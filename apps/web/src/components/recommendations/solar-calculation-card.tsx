import SolarCalculationForm from "@/components/recommendations/solar-calculation-form";
import { getSession } from "@/lib/auth/auth.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Info } from "lucide-react";
import React from "react";

export default async function SolarCalculationCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Balkonkraftwerk simulieren</CardTitle>
                    <CardDescription>
                        Mit dem Balkonkraftwerk-Simulator können Sie bestimmen, wie viel Energie eine
                        Photovoltaik-Anlage auf Ihrem Dach erzeugen würde. Geben Sie dazu die maximale Leistung der
                        Anlage an.
                    </CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger>
                        <Info className="h-7 w-7" />
                    </PopoverTrigger>
                    <PopoverContent>
                        Zur Berechnung wird für Ihre Adresse die Sonneneinstrahlung abgefragt und mit der angegebenen
                        Leistung multipliziert.
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                <SolarCalculationForm />
            </CardContent>
        </Card>
    );
}
