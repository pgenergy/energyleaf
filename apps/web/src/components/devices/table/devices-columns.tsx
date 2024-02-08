"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DeviceActionCell from "./device-action-cell";

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
        header: ({ column }) => (
            <div
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                style={{ cursor: "pointer" }}
            >
                Name
                {column.getIsSorted() === "asc" ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>
        ),
        cell: ({ row }) => row.getValue("name"),
    },
    {
        accessorKey: "created",
        header: "Erstellt",
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
        cell: ({ row }) => row.getValue("category"),
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
