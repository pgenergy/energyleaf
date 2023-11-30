'use client';

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import DeviceSortButton from "./device-sort-button";
import { SortOrder } from "@energyleaf/db/util";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import React from "react";
import { Pen, Trash } from "lucide-react";

interface Props {
    devices: { name: String, created: Date | null }[];
    sortOrder: SortOrder;
    sortProp: String;

}

export default function DevicesTable({ devices, sortOrder, sortProp }: Props) {
    const dateString = (created: Date | null) => {
        if (!created) {
            return ""
        }

        return `${format(created, "PPpp", {
            locale: de,
        })}`;
    };

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
                                <Button className="w-7 h-7 rounded-full bg-primary p-1">
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