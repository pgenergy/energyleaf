import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser } from "@/query/device";
import { getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { getTipsByDeviceCategory } from "@energyleaf/lib/tips";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import type { DeviceCategory } from "@energyleaf/postgres/types";
import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {
    const { session, user } = await getSession();

    if (!session) {
        return null;
    }

    const showTips = fulfills(user.appVersion, Versions.support);
    const devices = await getDevicesByUser(user.id);
    const deviceData = devices.map((device) => {
        return {
            ...device,
            categoryReferenceData: getReferencePowerDataForDeviceCategory(device.category as DeviceCategory),
            tips: showTips ? getTipsByDeviceCategory(device.category as DeviceCategory) : undefined,
        };
    });
    return <DevicesDataTable columns={devicesColumns} data={deviceData} showTips={showTips} />;
}
