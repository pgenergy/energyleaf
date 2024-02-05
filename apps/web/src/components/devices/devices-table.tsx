import { getSession } from "@/lib/auth/auth";
import { getDevicesByUser } from "@/query/device";
import { getAverageConsumptionPerDevice } from "@energyleaf/db/query";

import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const devices = await getDevicesByUser(session.user.id);
    const consumptionData = await getAverageConsumptionPerDevice();

    const enrichedDevices = devices.map(device => {
        const deviceConsumption = consumptionData.find(consumption => consumption.deviceId === device.id)?.averageConsumption;
        return {
            ...device,
            averageConsumption: typeof deviceConsumption === 'string' ? parseFloat(deviceConsumption) : deviceConsumption ?? 0,
        };
    });

    return (
        <DevicesDataTable
            columns={devicesColumns}
            data={enrichedDevices}
        />
    );
}
