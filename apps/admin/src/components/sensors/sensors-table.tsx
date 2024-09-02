import { sensorsOverviewColumns } from "@/components/sensors/table/sensors-columns";
import { getSensors } from "@/query/sensor";
import type { SensorSelectTypeWithUser } from "@energyleaf/postgres/types";
import { DataTable } from "@energyleaf/ui/data-table";
import React from "react";

export default async function SensorsTable() {
    const sensors: SensorSelectTypeWithUser[] = await getSensors();
    return <DataTable columns={sensorsOverviewColumns} data={sensors} />;
}
