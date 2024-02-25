import React from "react";
import { getSensorsByUser } from "@/actions/user";
import { sensorsColumns } from "@/components/sensors/table/sensors-columns";

import { DataTable } from "@energyleaf/ui";

interface Props {
    userId: number;
}

export default async function UserSensorsTable({ userId }: Props) {
    const sensors = await getSensorsByUser(userId);
    return <DataTable columns={sensorsColumns} data={sensors} />;
}
