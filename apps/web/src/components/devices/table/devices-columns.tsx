"use client";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon, CircleAlert } from "lucide-react";
import DeviceActionCell from "./device-action-cell";

export const devicesColumns: ColumnDef<DeviceSelectType>[] = [
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
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
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
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
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
            return DeviceCategory[categoryKey as keyof typeof DeviceCategory];
        },
    },
    {
        accessorKey: "powerEstimation",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Geschätzte Leistung
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
            const powerValue = row.getValue("powerEstimation");
            if (!powerValue) {
                return (
                    <div
                        className="flex flex-row items-center"
                        title="Die Leistung dieses Gerätes kann noch nicht geschätzt werden. Bitte markieren Sie weitere Peaks, um eine Schätzung zu erhalten."
                    >
                        <CircleAlert className="mr-2 h-5 w-5 text-warning" />
                        Nicht verfügbar
                    </div>
                );
            }
            return `${formatNumber(Number(powerValue))} Watt`; // TODO: Besser alignen, irgendwie nach rechts, ohne dass es kacke aussieht
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
