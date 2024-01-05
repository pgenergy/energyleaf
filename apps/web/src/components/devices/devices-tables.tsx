"use client";

import React, { useState } from "react";
import { deleteDevice } from "@/actions/device";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Pen, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import type { SortOrder } from "@energyleaf/db/util";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";

import DeviceDetailsDialog from "./device-details-dialog";
import DeviceSortButton from "./device-sort-button";

interface Props {
    userId: string;
    devices?: { id: number; name: string; created: Date | null }[] | null;
    sortOrder: SortOrder;
    sortProp: string;
}

export default function DevicesTable({ userId, devices, sortOrder, sortProp }: Props) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [device, setDevice] = useState<{ id: number; name: string } | undefined>(undefined);

    const dateString = (created: Date | null) => {
        if (!created) {
            return "";
        }

        return format(created, "PPpp", {
            locale: de,
        });
    };

    function onDeleteButtonClick(event: React.MouseEvent<HTMLButtonElement>, id: number) {
        event.stopPropagation(); // otherwise, the row click event is triggered and the edit dialog is opened
        const delDevice = devices?.find((x) => x.id === id);
        if (!delDevice) {
            return;
        }
        // eslint-disable-next-line no-alert -- TODO change to dialoge in the future
        if (!confirm("Soll das Gerät wirklich gelöscht werden?")) {
            return;
        }

        toast.promise(deleteDevice(delDevice.id, userId), {
            loading: "Lösche Gerät...",
            success: "Gerät erfolgreich gelöscht",
            error: "Fehler beim Löschen des Geräts",
        });
    }

    function onAddClick() {
        setDevice(undefined);
        setDetailsOpen(true);
    }

    function onEditClick(id: number) {
        const editDevice = devices?.find((x) => x.id === id);
        if (!editDevice) {
            return;
        }
        setDevice(editDevice);
        setDetailsOpen(true);
    }

    return (
        <div>
            <DeviceDetailsDialog device={device} open={detailsOpen} setOpen={setDetailsOpen} userId={userId} />
            <div className="flex justify-end">
                <Button onClick={onAddClick}>
                    <Plus className="mr-2" />
                    Gerät hinzufügen
                </Button>
            </div>
            {devices && devices.length > 0 ? (
                <div>
                    <Table>
                        <TableHeader>
                            <TableHead>
                                <DeviceSortButton propName="name" sortOrder={sortProp === "name" ? sortOrder : null}>
                                    Gerätename
                                </DeviceSortButton>
                            </TableHead>
                            <TableHead>
                                <DeviceSortButton
                                    propName="created"
                                    sortOrder={sortProp === "created" ? sortOrder : null}
                                >
                                    Erstelldatum
                                </DeviceSortButton>
                            </TableHead>
                            <TableHead>Aktionen</TableHead>
                        </TableHeader>
                        <TableBody>
                            {devices.map((deviceValue) => (
                                <TableRow
                                    className="cursor-pointer"
                                    key={Number(deviceValue.id)}
                                    onClick={() => {
                                        onEditClick(deviceValue.id);
                                    }}
                                >
                                    <TableCell>{deviceValue.name}</TableCell>
                                    <TableCell>{dateString(deviceValue.created)}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => {
                                                    onEditClick(deviceValue.id);
                                                }}
                                                size="icon"
                                                variant="default"
                                            >
                                                <Pen className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={(e) => {
                                                    onDeleteButtonClick(e, deviceValue.id);
                                                }}
                                                size="icon"
                                                variant="default"
                                            >
                                                <Trash className="h-4 w-4" />
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
    );
}
