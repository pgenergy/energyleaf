import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser } from "@/query/device";
import type { DeviceCategory } from "@energyleaf/db/types";
import { getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {
    const { session, user } = await getSession();

    if (!session) {
        return null;
    }

    const devices = await getDevicesByUser(user.id);
    const deviceData = devices.map((device) => {
        return {
            ...device,
            categoryReferenceData: getReferencePowerDataForDeviceCategory(device.category as DeviceCategory),
        };
    });
    return <DevicesDataTable columns={devicesColumns} data={deviceData} />;
}
