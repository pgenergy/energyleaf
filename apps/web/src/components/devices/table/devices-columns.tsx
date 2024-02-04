"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Button } from "@energyleaf/ui";

import DeviceActionCell from "./device-action-cell";

export interface DeviceTableType {
    id: number;
    name: string;
    created: Date | null;
    averageConsumption?: string;
}

export const devicesColumns: ColumnDef<DeviceTableType>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
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
            if (!row.getValue("created")) {
                return null;
            }

            return <span>{Intl.DateTimeFormat("de-DE").format(row.getValue("created"))}</span>;
        },
    },
    {
        accessorKey: "averageConsumption",
        header: () => "Durchschn. Verbrauch",
        cell: ({ row }) => {
            const consumptionValue = row.getValue("averageConsumption");
            const consumption = typeof consumptionValue === 'number' ? consumptionValue.toString() : consumptionValue;
            
            if (consumption) {
                const formattedConsumption = `${Number(consumption).toLocaleString("de-DE", {
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                })} kWh`;               
                return <span>{formattedConsumption}</span>;
            }
            return <span>N/A</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const device = row.original;
            return <DeviceActionCell device={device} />;
        },
    },
];
