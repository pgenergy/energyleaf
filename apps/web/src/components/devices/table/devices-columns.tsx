"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { track } from "@vercel/analytics";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui";

import DeviceActionCell from "./device-action-cell";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@energyleaf/ui";

let feedbackValue = undefined;

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
        accessorKey: "averageConsumption",
        header: () => "Durchschn. Verbrauch",
        cell: ({ row }) => {
            const consumptionValue = row.getValue("averageConsumption");
            const consumption = typeof consumptionValue === "number" ? consumptionValue.toString() : consumptionValue;

            if (consumption) {
                const formattedConsumption = `${Number(consumption).toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })} kWh`;
                return <span>{formattedConsumption}</span>;
            }
            return <span>N/A</span>;
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
        accessorKey: "feedback",
        header: "Feedback",
        cell: ({ row }) => {
            const negativeFeedback = () => { feedbackValue = 'Nein'; console.log('#', feedbackValue)};
            const positiveFeedback = () => { feedbackValue = 'Ja'; console.log('#', feedbackValue)};
            return <>{feedbackValue}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                            Option
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex cursor-pointer flex-row gap-2" onClick={() => negativeFeedback()}>
                            <Button size="icon" variant="ghost">Nein</Button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex cursor-pointer flex-row gap-2" onClick={() => positiveFeedback()}>
                            <Button size="icon" variant="ghost">Ja</Button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
