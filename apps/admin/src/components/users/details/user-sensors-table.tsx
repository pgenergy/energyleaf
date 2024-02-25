import React from "react";
import { getSensorsByUser } from "@/actions/user";
import { sensorsColumns, type SensorTableType } from "@/components/sensors/table/sensors-columns";

import type { SensorType } from "@energyleaf/db/schema";
import { DataTable } from "@energyleaf/ui";

interface Props {
    userId: number;
}

function mapSensor(sensorInput: { id: string; clientId: string; sensorType: SensorType }): SensorTableType {
    return {
        id: sensorInput.id,
        clientId: sensorInput.clientId,
        type: sensorInput.sensorType,
    };
}

export default async function UserSensorsTable({ userId }: Props) {
    const sensors = await getSensorsByUser(userId);
    const data = sensors.map((sensor) => mapSensor(sensor));
    return <DataTable columns={sensorsColumns} data={data} />;
}
