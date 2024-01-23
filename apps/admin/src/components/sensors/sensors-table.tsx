"use client";

import {DataTable} from "@energyleaf/ui";
import React from "react";
import type { SensorTableType} from "@/components/sensors/table/sensors-columns";
import {sensorsColumns} from "@/components/sensors/table/sensors-columns";

export default function SensorsTable() {
    const data: SensorTableType[] = [
        {
            key: "test",
            user: "Max Mustermann",
            id: 1,
            type: "electricity"
        },
        {
            key: "test2",
            user: "Max Mustermann",
            id: 2
        },
        {
            key: "test3",
            user: "Otto Normalverbraucher",
            id: 3
        }
    ]

    return (
        <DataTable columns={sensorsColumns} data={data} />
    );
}