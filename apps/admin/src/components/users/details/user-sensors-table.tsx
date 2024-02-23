import {DataTable} from "@energyleaf/ui";
import {sensorsColumns, SensorTableType} from "@/components/sensors/table/sensors-columns";
import React from "react";
import {getSensorsByUser} from "@/actions/user";
import {SensorType} from "@energyleaf/db/schema";

interface Props {
    userId: number;
}

function mapSensor(sensorInput: {id: string, clientId: string, sensor_type: SensorType}): SensorTableType {
    return {
        id: sensorInput.id,
        clientId: sensorInput.clientId,
        type: sensorInput.sensor_type,
    }
}

export default async function UserSensorsTable({userId}: Props) {
    const sensors = await getSensorsByUser(userId);
    const data = sensors.map((sensor) => mapSensor(sensor));
    return (
        <DataTable columns={sensorsColumns} data={data} />
    );
}