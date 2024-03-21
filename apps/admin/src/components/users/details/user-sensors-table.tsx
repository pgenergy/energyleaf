import React from "react";
import { sensorsColumns } from "@/components/sensors/table/sensors-columns";
import { getSensorsByUser } from "@/query/sensor";

import { DataTable } from "@energyleaf/ui";

interface Props {
    userId: string;
}

export default async function UserSensorsTable({ userId }: Props) {
    const sensors = await getSensorsByUser(userId);
    const data = sensors.map((sensor) => ({
        sensor,
        user: null,
    }));
    return <DataTable columns={sensorsColumns} data={data} />;
}
