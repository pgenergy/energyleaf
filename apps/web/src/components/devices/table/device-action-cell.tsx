"use client";

import { useDeviceContext } from "@/hooks/device-hook";
import type { DeviceSelectType } from "@energyleaf/db/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui/dropdown-menu";
import { Button } from "@energyleaf/ui/button";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";

interface Props {
    device: DeviceSelectType;
}

export default function DeviceActionCell({ device }: Props) {
    const deviceContext = useDeviceContext();

    function openDeleteDialog() {
        deviceContext.setDevice(device);
        deviceContext.setDeleteDialogOpen(true);
    }

    function openEditDialog() {
        deviceContext.setDevice(device);
        deviceContext.setDialogOpen(true);
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
                    <EditIcon className="h-4 w-4" />
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
