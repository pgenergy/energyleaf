import {DataTable} from "@energyleaf/ui";
import React from "react";
import type { SensorTableType} from "@/components/sensors/table/sensors-columns";
import {sensorsColumns} from "@/components/sensors/table/sensors-columns";
import {getSensors} from "@/actions/sensors";
import type {SensorWithUser} from "@energyleaf/db/query";
import {SensorType} from "@energyleaf/db/schema";

function mapSensor(sensorWithUser: SensorWithUser) : SensorTableType {
    const {sensor, user} = sensorWithUser;

    const sensorTypeDescriptions: { [key in SensorType]: string } = {
        [SensorType.Electricity]: "Strom",
        [SensorType.Gas]: "Gas",
    };

    return {
        id: sensor.id,
        name: sensor.code,
        key: sensor.key,
        macAddress: sensor.macAddress,
        code: sensor.code,
        type: sensorTypeDescriptions[sensor.sensor_type],
        user: user?.username,
    };
}

export default async function SensorsTable() {
    const sensors= await getSensors();
    const data = sensors.map((sensor: SensorWithUser) => mapSensor(sensor));
    return (
        <DataTable columns={sensorsColumns} data={data} />
    );
}