import { getSession } from "@/lib/auth/auth.server";
import { getEnergyTips } from "@/query/recommendations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import {} from "lucide-react";
import EnergyTipRandomPicker from "./energy-tip-random-picker";

export default async function EnergyTipsCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const energyTips = await getEnergyTips(user.id);
    const shuffledTips = energyTips.sort(() => Math.random() - 0.5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Energiespartipps</CardTitle>
                <CardDescription>Hier erhalten Sie Tipps, um Strom zu sparen.</CardDescription>
            </CardHeader>
            <CardContent>
                <EnergyTipRandomPicker tips={shuffledTips} />
            </CardContent>
        </Card>
    );
}
