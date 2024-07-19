import AmortizationCard, { type DeviceItem } from "@/components/recommendations/amortization-card";
import { getSession } from "@/lib/auth/auth.server";
import { getUserData } from "@/query/user";
import { getDevicesByUser } from "@energyleaf/db/query";
import type { DeviceCategory } from "@energyleaf/db/types";
import { getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";

export const metadata = {
    title: "Empfehlungen | Energyleaf",
};

export default async function RecommendationsPage() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData?.workingPrice) {
        return null; // TODO: Was schönes basteln.
    }

    const devices = await getDevicesByUser(user.id);
    const mappedDevices: DeviceItem[] = devices
        .filter((d) => {
            const referenceData = getReferencePowerDataForDeviceCategory(d.category as DeviceCategory);
            return d.powerEstimation && d.weeklyUsageEstimation && referenceData.averagePower < d.powerEstimation;
        })
        .map((device) => {
            return {
                category: device.category as DeviceCategory,
                id: device.id,
                name: device.name,
                powerEstimation: device.powerEstimation ?? 0,
                weeklyUsageEstimation: device.weeklyUsageEstimation ?? 0,
                weeklyUsage: device.weeklyUsageEstimation ?? 0,
            };
        });

    return (
        <div className="flex flex-col gap-4">
            <AmortizationCard workingPrice={userData.workingPrice} devices={mappedDevices} />
        </div>
    );
}
