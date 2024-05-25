"use client";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { track } from "@vercel/analytics";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DeviceActionCell from "./device-action-cell";

export const devicesColumns: ColumnDef<DeviceSelectType>[] = [
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
            if (!row.getValue("created")) {
                return null;
            }

            return <span>{Intl.DateTimeFormat("de-DE").format(row.getValue("created"))}</span>;
        },
    },
    {
        accessorKey: "category",
        header: "Kategorie",
        cell: ({ row }) => {
            const categoryKey = row.getValue("category");
            const categoryValue = DeviceCategory[categoryKey as keyof typeof DeviceCategory];
            return categoryValue;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
