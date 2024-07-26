"use client";

import { type DeviceCategory, DeviceCategoryTitles, type DeviceSelectType } from "@energyleaf/db/types";
import {
    type DeviceCategoryPower,
    deviceCategoryPowerStateDescription,
    formatNumber,
    getCategoryPowerState,
} from "@energyleaf/lib";
import type { EnergyTip } from "@energyleaf/lib/tips";
import { Button } from "@energyleaf/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import type { ColumnDef } from "@tanstack/react-table";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronsUpDownIcon,
    CircleAlert,
    DotIcon,
    ExternalLink,
    Info,
    LightbulbIcon,
} from "lucide-react";
import { Fragment } from "react";
import DeviceCategoryIcon from "../device-category-icon";
import DeviceActionCell from "./device-action-cell";
import DeviceCategoryPowerIcon from "./device-category-power-icon";

export type DeviceColumnsType = DeviceSelectType & {
    categoryReferenceData: DeviceCategoryPower;
    tips: EnergyTip[] | undefined;
};

export const devicesColumns: ColumnDef<DeviceColumnsType>[] = [
    {
        accessorKey: "tips",
        header: undefined,
        cell: ({ row }) => {
            const tips = row.getValue<EnergyTip[] | undefined>("tips");
            if (!tips || tips.length === 0) {
                return null;
            }

            return (
                <Popover>
                    <PopoverTrigger title="Stromspartipps für Gerät anzeigen">
                        <LightbulbIcon className="h-5 w-5" />
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2">
                        <span className="font-bold">Stromspartipps</span>
                        <div className="grid grid-flow-row grid-cols-[auto_1fr] gap-2">
                            {tips?.map((tip, index) => (
                                <Fragment key={index.toString()}>
                                    <DotIcon className="h-4 w-4" />
                                    <div>
                                        <span>{tip.text}</span>
                                        <span className="inline-flex items-center">
                                            <a href={tip.linkToSource} className="ml-1 flex items-center">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </span>
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            );
        },
    },
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
            const category = row.getValue<DeviceCategory>("category");
            return (
                <div className="flex flex-row items-center gap-2">
                    <DeviceCategoryIcon category={category} />
                    {DeviceCategoryTitles[category]}
                </div>
            );
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
            return `${formatNumber(Number(powerValue))} Watt`;
        },
    },
    {
        accessorKey: "categoryReferenceData",
        header: "Vergleich zu Referenz",
        cell: ({ row }) => {
            const powerEstimation = row.getValue<number | null>("powerEstimation");
            if (!powerEstimation) {
                return null;
            }

            const deviceCategoryPower = row.getValue<DeviceCategoryPower>("categoryReferenceData");
            const { minimumPower, maximumPower, linkToSource } = deviceCategoryPower;
            const state = getCategoryPowerState(deviceCategoryPower, powerEstimation);
            const stateDeterminationDescription = deviceCategoryPowerStateDescription[state];

            return (
                <div className="flex flex-row items-center gap-2">
                    <DeviceCategoryPowerIcon state={state} />
                    {state}
                    <Popover>
                        <PopoverTrigger>
                            <Info className="ml-2 h-4 w-4" />
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2">
                            <div>
                                Ein Gerät dieser Kategorie hat eine typische Leistung von {formatNumber(minimumPower)}{" "}
                                bis {formatNumber(maximumPower)} Watt.
                                {linkToSource && linkToSource.length > 0 && (
                                    <span className="inline-flex items-center">
                                        <a href={linkToSource} className="ml-1 flex items-center">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </span>
                                )}
                            </div>
                            {stateDeterminationDescription}
                        </PopoverContent>
                    </Popover>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DeviceActionCell device={row.original} />,
    },
];
