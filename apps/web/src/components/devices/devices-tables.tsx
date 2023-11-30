'use client';

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import DeviceSortButton from "./device-sort-button";
import { SortOrder } from "@energyleaf/db/util";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import React from "react";
import { Pen, Trash } from "lucide-react";
import { deleteDevice } from "@/actions/device";
import { toast } from "@energyleaf/ui/hooks";

interface Props {
    userId: string;
    devices: { id: Number, name: String, created: Date | null }[];
    sortOrder: SortOrder;
    sortProp: String;
}

export default function DevicesTable({ userId, devices, sortOrder, sortProp }: Props) {
    console.log(devices)
    const dateString = (created: Date | null) => {
        if (!created) {
            return ""
        }

        return `${format(created, "PPpp", {
            locale: de,
        })}`;
    };

    async function onDeleteButtonClick(device: { id: any; name?: String; created?: Date | null; }) {
        if (!confirm("Soll das Gerät wirklich gelöscht werden?")) {
            return
            
        }

        try {
            await deleteDevice(device.id, userId)
            toast({
                title: "Erfolgreich gelöscht",
                description: "Deine Daten wurden erfolgreich gelöscht",
            });
        } catch (e) {
            toast({
                title: "Fehler beim Löschen",
                description: "Deine Daten konnten nicht gelöscht werden",
                variant: "destructive",
            });
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableHead>
                    <DeviceSortButton propName="name" sortOrder={sortProp === "name" ? sortOrder : null}>
                        Gerätename
                    </DeviceSortButton>
                </TableHead>
                <TableHead>
                    <DeviceSortButton propName="created" sortOrder={sortProp === "created" ? sortOrder : null}>
                        Erstelldatum
                    </DeviceSortButton>
                </TableHead>
                <TableHead>
                    Aktionen
                </TableHead>
            </TableHeader>
            <TableBody>
                { devices.map((device) => (
                    <TableRow key={crypto.randomUUID()}>
                        <TableCell>
                            {device.name}
                        </TableCell>
                        <TableCell>
                            {dateString(device.created)}
                        </TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Button className="w-7 h-7 rounded-full bg-primary p-1">
                                    <Pen className="w-4 h-4" />
                                </Button>
                                <Button className="w-7 h-7 rounded-full bg-primary p-1" onClick={() => onDeleteButtonClick(device)}>
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}