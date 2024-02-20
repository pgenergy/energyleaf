
import { getUsersWitDueReport } from "@/query/user";

import { devicesColumns } from "./table/devices-columns";
import { DevicesDataTable } from "./table/devices-data-table";

export default async function DevicesTable() {

    const user = await getUsersWitDueReport();

    return (
        <DevicesDataTable
            columns={devicesColumns}
            data={devices.map((d) => ({ id: d.id, name: d.name, created: d.created }))}
        />
    );
}
