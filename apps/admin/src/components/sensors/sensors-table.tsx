import React from "react";
import { getSensors } from "@/actions/sensors";
import type { SensorOverviewTableType } from "@/components/sensors/table/sensors-columns";
import { sensorsOverviewColumns } from "@/components/sensors/table/sensors-columns";

import type { SensorWithUser } from "@energyleaf/db/query";
import { DataTable } from "@energyleaf/ui";

function mapSensor(sensorWithUser: SensorWithUser): SensorOverviewTableType {
    const { sensor, user } = sensorWithUser;

    return {
        id: sensor.id,
        clientId: sensor.clientId,
        type: sensor.sensorType,
        user_name: user?.username,
        user_id: user?.id,
    };
}

export default async function SensorsTable() {
    const sensors: SensorWithUser[] = await getSensors();
    const data = sensors.map((sensor: SensorWithUser) => mapSensor(sensor));
    return <DataTable columns={sensorsOverviewColumns} data={data} />;
}
