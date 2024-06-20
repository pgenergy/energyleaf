import { getSession } from "@/lib/auth/auth.server";
import { getDevicesByUser } from "@/query/device";
import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {
    const { session, user } = await getSession();

    if (!session) {
        return null;
    }

    const devices = await getDevicesByUser(user.id);
    return <DevicesDataTable columns={devicesColumns} data={devices} />;
}
