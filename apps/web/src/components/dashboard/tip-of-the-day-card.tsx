import { getSession } from "@/lib/auth/auth.server";
import { getEnergyTipOfTheDay } from "@/query/recommendations";
import { isDeviceCategory } from "@energyleaf/lib/tips";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { LightbulbIcon } from "lucide-react";
import DeviceCategoryIcon from "../devices/device-category-icon";
import EnergyTipCardDescription from "../recommendations/tips/energy-tip-card-description";
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
                <CardDescription className="flex flex-row items-center gap-1">
                    <EnergyTipCardDescription tip={energyTip} />
                    {energyTip.belongsTo && isDeviceCategory(energyTip.belongsTo) ? (
                        <DeviceCategoryIcon category={energyTip.belongsTo} className="h-5 w-5" />
                    ) : null}
                </CardDescription>
            </CardHeader>
            <CardContent className="items-center text-center text-xl italic">
                <EnergyTipText tip={energyTip} />
            </CardContent>
        </Card>
    );
}
