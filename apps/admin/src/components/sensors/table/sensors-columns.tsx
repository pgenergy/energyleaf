"use client";

import SensorUserAssignmentForm from "@/components/sensors/sensor-user-assignment-form";
import SensorActionCell from "@/components/sensors/table/sensor-action-cell";
import type { SensorSelectTypeWithUser } from "@energyleaf/postgres/types";
import { SensorTypeMap } from "@energyleaf/postgres/types";
import { Button } from "@energyleaf/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from "lucide-react";
import React from "react";

export const sensorsColumns: ColumnDef<SensorSelectTypeWithUser>[] = [
    {
        accessorKey: "sensor.clientId",
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
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const clientId = row.original.sensor.clientId;
            return <span>{clientId}</span>;
        },
    },
    {
        accessorKey: "sensor.sensorType",
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
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const sensorType = row.original.sensor.sensorType;
            const value = SensorTypeMap[sensorType];
            if (!value) {
                return null;
            }
            return <span>{value}</span>;
        },
    },
];

export const sensorsOverviewColumns: ColumnDef<SensorSelectTypeWithUser>[] = [
    ...sensorsColumns,
    {
        accessorKey: "user.username",
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
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const sensor = row.original.sensor;
            const userId: string | undefined = row.original.user?.id || undefined;
            const userName: string | undefined = row.original.user?.username || undefined;
            return <SensorUserAssignmentForm sensor={sensor} selectedUserId={userId} selectedUserName={userName} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const sensor = row.original.sensor;
            return <SensorActionCell sensor={sensor} />;
        },
    },
];
