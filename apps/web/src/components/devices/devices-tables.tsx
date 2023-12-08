'use client';

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import DeviceSortButton from "./device-sort-button";
import { SortOrder } from "@energyleaf/db/util";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import React, { useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
import { deleteDevice } from "@/actions/device";
import { toast } from "@energyleaf/ui/hooks";
import DeviceDetailsDialog from "./device-details-dialog";

interface Props {
    userId: string;
    devices?: { id: Number, name: String, created: Date | null }[] | null;
    sortOrder: SortOrder;
    sortProp: String;
}

export default function DevicesTable({ userId, devices, sortOrder, sortProp }: Props) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [device, setDevice] = useState<{ id: Number; name: String; } | undefined>(undefined)

    const dateString = (created: Date | null) => {
        if (!created) {
            return ""
        }

        return `${format(created, "PPpp", {
            locale: de,
        })}`;
    };

    async function onDeleteButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, device: { id: any; name?: String; created?: Date | null; }) {
        event.stopPropagation()
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

    function onAddClick() {
        setDevice(undefined)
        setDetailsOpen(true)
    }

    function onEditClick(device: { id: Number; name: String; }) {
        setDevice(device)
        setDetailsOpen(true)
    }

    return (
        <div>
            <DeviceDetailsDialog userId={userId} open={detailsOpen} setOpen={setDetailsOpen} device={device}/>
            <div className="flex justify-end">
                <Button onClick={onAddClick}>
                    <Plus className="mr-2"/>
                    Gerät hinzufügen
                </Button>
            </div>
            {(devices && devices.length > 0) ? (
                <div>
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
                                <TableRow key={Number(device.id)} className="cursor-pointer" onClick={() => onEditClick(device)}>
                                    <TableCell>
                                        {device.name}
                                    </TableCell>
                                    <TableCell>
                                        {dateString(device.created)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button variant="default" size="icon" onClick={() => onEditClick(device)}>
                                                <Pen className="w-4 h-4" />
                                            </Button>
                                            <Button variant="default" size="icon" onClick={e => onDeleteButtonClick(e, device)}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-row justify-center">
                    <p className="text-muted-foreground">Noch keine Geräte vorhanden</p>
                </div>
            )}
        </div>
    )
}