import React from "react";
import { getSensors } from "@/actions/sensors";
import { sensorsOverviewColumns } from "@/components/sensors/table/sensors-columns";

import type { SensorSelectTypeWithUser } from "@energyleaf/db/types";
import { DataTable } from "@energyleaf/ui";

export default async function SensorsTable() {
    const sensors: SensorSelectTypeWithUser[] = await getSensors();
    return <DataTable columns={sensorsOverviewColumns} data={sensors} />;
}
