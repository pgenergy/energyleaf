"use client";

import {type ColumnDef} from "@tanstack/react-table";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";

import {Button} from "@energyleaf/ui";
import SensorActionCell from "@/components/sensors/table/sensor-action-cell";
import React from "react";
import SensorUserAssignmentForm from "@/components/sensors/sensor-user-assignment-form";
import {SensorType} from "@energyleaf/db/schema";

export interface SensorTableType {
    id: string;
    clientId: string;
    type: SensorType
}

export interface SensorOverviewTableType extends SensorTableType {
    user_name: string | undefined,
    user_id: number | undefined,
}

const sensorTypeDescriptions: { [key in SensorType]: string } = {
    [SensorType.Electricity]: "Strom",
    [SensorType.Gas]: "Gas",
};

export const sensorsColumns: ColumnDef<SensorTableType>[] = [
    {
        accessorKey: "clientId",
        header: ({column}) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    MAC-Adresse
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4"/>
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4"/>
                    )}
                </Button>
            );
        },
        cell: ({row}) => {
            return <span>{row.getValue("clientId")}</span>;
        },
    },
    {
        accessorKey: "type",
        header: ({column}) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Typ
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4"/>
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4"/>
                    )}
                </Button>
            );
        },
        cell: ({row}) => {
            const sensorType: SensorType = row.original.type;
            const value = sensorTypeDescriptions[sensorType];
            if (!value) {
                return null;
            }
            return <span>{value}</span>;
        },
    },
];

export const sensorsOverviewColumns: ColumnDef<SensorOverviewTableType>[] = [
    ...sensorsColumns.map((def) => def as ColumnDef<SensorOverviewTableType>),
    {
        accessorKey: "user_name",
        header: ({column}) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Benutzer
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4"/>
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4"/>
                    )}
                </Button>
            );
        },
        cell: ({row}) => {
            const userId: number | undefined = row.original.user_id;
            const userName: string | undefined = row.original.user_name;
            const sensorId: string = row.original.id;
            return <SensorUserAssignmentForm selectedUserId={userId} selectedUserName={userName} sensorId={sensorId}/>
        },
    },
    {
        id: "actions",
        cell: ({row}) => {
            const sensor = row.original;
            return <SensorActionCell sensor={sensor}/>;
        },
    },
];
