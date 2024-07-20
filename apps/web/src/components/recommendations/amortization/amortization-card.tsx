import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser, getUserData } from "@energyleaf/db/query";
import type { DeviceCategory, DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber, getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { useState } from "react";
import AmortizationCardContent from "./amortization-card-content";
import AmortizationSelect from "./amortization-select";

export interface DeviceItem {
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
            <CardHeader>
                <CardTitle>Geräte-Amortisation</CardTitle>
                <CardDescription>
                    Hier können Sie prüfen, nach welcher Zeit sich die Anschaffung eines neuen Gerätes rentiert hat.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AmortizationCardContent devices={mappedDevices} workingPrice={workingPrice} />
            </CardContent>
        </Card>
    );
}
