'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@energyleaf/ui";
import DeviceSortButton from "./device-sort-button";
import { SortOrder } from "@energyleaf/db/util";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import React from "react";

interface Props {
    devices: { id: Number, name: String, created: Date | null }[];
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
            </TableHeader>
            <TableBody>
                { devices.map((device) => (
                    <TableRow key={Number(device.id)}>
                        <TableCell>
                            {device.name}
                        </TableCell>
                        <TableCell>
                            {dateString(device.created)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}