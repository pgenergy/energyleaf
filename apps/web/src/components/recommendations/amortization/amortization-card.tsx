import { getSession } from "@/lib/auth/auth.server";
import { getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { getDevicesByUser } from "@energyleaf/postgres/query/device";
import { getUserData } from "@energyleaf/postgres/query/user";
import type { DeviceCategory } from "@energyleaf/postgres/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { Info } from "lucide-react";
import Link from "next/link";
import AmortizationCardContent from "./amortization-card-content";

export class DeviceItem {
    category: DeviceCategory;
    id: number;
    name: string;
    powerEstimation: number;
    weeklyUsageEstimation: number;
    weeklyUsage: number;
}

export default async function AmortizationCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    const workingPrice = userData?.workingPrice ?? null;
    const devicePowerEstimationRSquared = userData?.devicePowerEstimationRSquared ?? null;

    const devices = await getDevicesByUser(user.id);
    const mappedDevices: DeviceItem[] = devices
        .filter((device) => device.powerEstimation && device.weeklyUsageEstimation)
        .map((device) => {
            const referenceData = getReferencePowerDataForDeviceCategory(device.category as DeviceCategory);
            return {
                category: device.category as DeviceCategory,
                id: device.id,
                name: device.name,
                powerEstimation: device.powerEstimation ?? 0,
                weeklyUsageEstimation: device.weeklyUsageEstimation ?? 0,
                weeklyUsage: device.weeklyUsageEstimation ?? 0,
                diffToAveragePower: (device.powerEstimation ?? 0) - referenceData.averagePower,
            };
        })
        .filter((d) => d.diffToAveragePower > 0)
        .sort((a, b) => b.diffToAveragePower - a.diffToAveragePower);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-2">
                    <CardTitle>Geräte-Amortisation</CardTitle>
                    <CardDescription>
                        Hier können Sie prüfen, nach welcher Zeit sich die Anschaffung eines neuen Gerätes rentiert.
                    </CardDescription>
                </div>
                <Popover>
                    <PopoverTrigger>
                        <Info className="h-7 w-7" />
                    </PopoverTrigger>
                    <PopoverContent>
                        Die Amortisationsrechnung berücksichtigt weder den{" "}
                        <Link
                            href="https://de.wikipedia.org/wiki/Zeitwert_des_Geldes"
                            className="text-primary underline hover:no-underline"
                        >
                            Zeitwert des Geldes
                        </Link>{" "}
                        noch die Inflation.
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent>
                <AmortizationCardContent
                    devices={mappedDevices}
                    workingPrice={workingPrice}
                    powerEstimationRSquared={devicePowerEstimationRSquared}
                />
            </CardContent>
        </Card>
    );
}
