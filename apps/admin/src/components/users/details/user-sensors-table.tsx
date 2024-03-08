import React from "react";
import { sensorsColumns } from "@/components/sensors/table/sensors-columns";

import { DataTable } from "@energyleaf/ui";
import {getSensorsByUser} from "@/query/sensor";

interface Props {
    userId: number;
}

export default async function UserSensorsTable({ userId }: Props) {
    const sensors = await getSensorsByUser(userId);
    const data = sensors.map((sensor) => ({
        sensor,
        user: null,
    }));
    return <DataTable columns={sensorsColumns} data={data} />;
}
