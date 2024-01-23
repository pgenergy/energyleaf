import { getSession } from "@/lib/auth/auth";
import { getDevicesByUser } from "@/query/device";

import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const devices = await getDevicesByUser(session.user.id);

    return (
        <DevicesDataTable
            columns={devicesColumns}
            data={devices.map((d) => ({ id: d.id, name: d.name, created: d.created }))}
        />
    );
}
