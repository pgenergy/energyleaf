import { getSession } from "@/lib/auth/auth.server";
import { getEnergyTipOfTheDay } from "@/query/recommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { LightbulbIcon } from "lucide-react";
import EnergyTipText from "../recommendations/tips/energy-tip-text";

export default async function TipOfTheDayCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const energyTip = await getEnergyTipOfTheDay(user.id);

    return (
        <Card className="col-span-1 w-full md:col-span-3">
            <CardHeader>
                <CardTitle className="flex flex-row gap-1">
                    Energiespartipp des Tages <LightbulbIcon className="text-primary" />
                </CardTitle>
            </CardHeader>
            <CardContent className="items-center text-center text-xl italic">
                <EnergyTipText tip={energyTip} />
            </CardContent>
        </Card>
    );
}
