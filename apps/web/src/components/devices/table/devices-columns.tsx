"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { track } from "@vercel/analytics";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DeviceActionCell from "./device-action-cell";
import { Button } from "@energyleaf/ui";
import { DeviceCategory } from "@/lib/schema/device";

export interface DeviceTableType {
    id: number;
    name: string;
    created: Date | null;
    averageConsumption: number;
    category: string;
}

export const devicesColumns: ColumnDef<DeviceTableType>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        track("toggleSortAfterDeviceName()");
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Name
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            return <span>{row.getValue("name")}</span>;
        },
    },
    {
        accessorKey: "created",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        track("toggleSortAfterDateOfCreation()");
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Erstellt
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const created = row.getValue("created");
            if (typeof created === 'string' || typeof created === 'number' || created instanceof Date) {
                return Intl.DateTimeFormat("de-DE").format(new Date(created));
            } else {
                return "";
            }
        },
    },
    {
        accessorKey: "averageConsumption",
        header: "Durchschn. Verbrauch",
        cell: ({ row }) => `${row.getValue("averageConsumption")} kWh`,
    },
    {
        accessorKey: "category",
        header: "Kategorie",
        cell: ({ row }) => {
            const categoryKey = row.getValue("category");
            const categoryValue = DeviceCategory[categoryKey as keyof typeof DeviceCategory];
            return categoryValue || 'Unbekannt';
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
