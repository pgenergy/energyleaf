"use client";

import { removeUserFromSensor } from "@/actions/sensors";
import { useSensorContext } from "@/hooks/sensor-hook";
import { Edit2Icon, MinusIcon, MoreVerticalIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import type { SensorSelectType } from "@energyleaf/db/types";
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

    function openAddValueDialog() {
        sensorContext.setSensor(sensor);
        sensorContext.setAddValueDialogOpen(true);
    }

    function removeUser() {
        toast.promise(removeUserFromSensor(sensor.clientId), {
            loading: "Nutzer wird entfernt...",
            success: "Nutzer wurde entfernt",
            error: "Fehler beim Entfernen des Nutzers",
        });
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
                <DropdownMenuItem className="flex cursor-pointer flex-row gap-2" onClick={openAddValueDialog}>
                    <PlusCircleIcon className="h-4 w-4" />
                    Wert hinzufügen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex cursor-pointer flex-row gap-2" onClick={removeUser}>
                    <MinusIcon className="h-4 w-4" />
                    Nutzer entfernen
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
