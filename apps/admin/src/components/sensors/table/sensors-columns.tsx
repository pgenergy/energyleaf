"use client";

import React from "react";
import SensorUserAssignmentForm from "@/components/sensors/sensor-user-assignment-form";
import SensorActionCell from "@/components/sensors/table/sensor-action-cell";
import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import type { SensorSelectType } from "@energyleaf/db/util";
import { SensorTypeMap } from "@energyleaf/db/util";
import { Button } from "@energyleaf/ui";

export interface SensorOverviewTableType extends SensorSelectType {
    user_name: string | undefined;
    user_id: number | undefined;
}

export const sensorsColumns: ColumnDef<SensorSelectType>[] = [
    {
        accessorKey: "clientId",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    MAC-Adresse
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            return <span>{row.getValue("clientId")}</span>;
        },
    },
    {
        accessorKey: "type",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Typ
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const sensorType = row.original.sensorType;
            const value = SensorTypeMap[sensorType];
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
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Benutzer
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const userId: number | undefined = row.original.user_id;
            const userName: string | undefined = row.original.user_name;
            const clientId: string = row.original.clientId;
            return <SensorUserAssignmentForm clientId={clientId} selectedUserId={userId} selectedUserName={userName} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const sensor = row.original;
            return <SensorActionCell sensor={sensor} />;
        },
    },
];
