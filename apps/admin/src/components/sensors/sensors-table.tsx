import React from "react";
import { getSensors } from "@/actions/sensors";
import type { SensorOverviewTableType } from "@/components/sensors/table/sensors-columns";
import { sensorsOverviewColumns } from "@/components/sensors/table/sensors-columns";

import type { SensorSelectTypeWithUser } from "@energyleaf/db/util";
import { DataTable } from "@energyleaf/ui";

function mapSensor(sensorWithUser: SensorSelectTypeWithUser): SensorOverviewTableType {
    const { sensor, user } = sensorWithUser;

    return {
        ...sensor,
        user_name: user ? user.username : undefined,
        user_id: user ? user.id : undefined,
    };
}

export default async function SensorsTable() {
    const sensors: SensorSelectTypeWithUser[] = await getSensors();
    const data = sensors.map((sensor: SensorSelectTypeWithUser) => mapSensor(sensor));
    return <DataTable columns={sensorsOverviewColumns} data={data} />;
}
