"use client";

import type { SensorTableType } from "@/components/sensors/table/sensors-columns";
import { useSensorContext } from "@/hooks/sensor-hook";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";

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
    sensor: SensorTableType;
}

export default function SensorActionCell({ sensor }: Props) {
    const sensorContext = useSensorContext();

    function openDeleteDialog() {
        sensorContext.setSensor(sensor);
        sensorContext.setDeleteDialogOpen(true);
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
