import {DataTable} from "@energyleaf/ui";
import React from "react";
import type {SensorOverviewTableType} from "@/components/sensors/table/sensors-columns";
import {sensorsOverviewColumns} from "@/components/sensors/table/sensors-columns";
import {getSensors} from "@/actions/sensors";
import type {SensorWithUser} from "@energyleaf/db/query";

function mapSensor(sensorWithUser: SensorWithUser) : SensorOverviewTableType {
    const {sensor, user} = sensorWithUser;

    return {
        id: sensor.id,
        clientId: sensor.clientId,
        type: sensor.sensor_type,
        user_name: user?.username,
        user_id: user?.id,
    };
}

export default async function SensorsTable() {
    const sensors : SensorWithUser[] = await getSensors();
    const data = sensors.map((sensor: SensorWithUser) => mapSensor(sensor));
    return (
        <DataTable columns={sensorsOverviewColumns} data={data} />
    );
}