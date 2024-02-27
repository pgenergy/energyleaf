"use client";

import { useSensorContext } from "@/hooks/sensor-hook";
import { Edit2Icon, MoreVerticalIcon, TrashIcon } from "lucide-react";

import type { SensorSelectType } from "@energyleaf/db/util";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui";

interface Props {
    sensor: SensorSelectType;
}

export default function SensorActionCell({ sensor }: Props) {
    const sensorContext = useSensorContext();

    function openDeleteDialog() {
        sensorContext.setSensor(sensor);
        sensorContext.setDeleteDialogOpen(true);
    }

    function openEditDialog() {
        sensorContext.setSensor(sensor);
        sensorContext.setEditDialogOpen(true);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                    <MoreVerticalIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex cursor-pointer flex-row gap-2" onClick={openEditDialog}>
                    <Edit2Icon className="h-4 w-4" />
                    Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2 text-destructive"
                    onClick={openDeleteDialog}
                >
                    <TrashIcon className="h-4 w-4" />
                    Löschen
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
