"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Button } from "@energyleaf/ui";
import SensorActionCell from "@/components/sensors/table/sensor-action-cell";

export interface SensorTableType {
    id: number;
    macAddress: string;
    user: string | undefined,
    type: string
}

export const sensorsColumns: ColumnDef<SensorTableType>[] = [
    {
        accessorKey: "macAddress",
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
            return <span>{row.getValue("macAddress")}</span>;
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
            const value: string | undefined = row.getValue("type");
            if (!value) {
                return null;
            }
            return <span>{value}</span>;
        },
    },
    {
        accessorKey: "user",
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
            const value: string | undefined = row.getValue("user");
            if (!value) {
                return <span>-</span>;
            }
            return <span>{value}</span>;
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
