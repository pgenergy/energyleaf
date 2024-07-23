import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import {} from "lucide-react";
import EnergyTipRandomPicker from "./energy-tip-random-picker";

export default async function EnergyTipsCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiespartipps</CardTitle>
                <CardDescription>Hier erhalten Sie Tipps, um Strom zu sparen.</CardDescription>
            </CardHeader>
            <CardContent>
                <EnergyTipRandomPicker />
            </CardContent>
        </Card>
    );
}
