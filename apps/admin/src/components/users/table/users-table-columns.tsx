"use client";

import UserActionCell from "@/components/users/table/user-action-cell";
import type { ColumnDef } from "@tanstack/react-table";
import { BanIcon, CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import type { UserSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui";

export const usersTableColumns: ColumnDef<UserSelectType>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    ID
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            return <span>{row.getValue("id")}</span>;
        },
    },
    {
        accessorKey: "username",
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
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            return <span>{row.getValue("username")}</span>;
        },
    },
    {
        accessorKey: "mail",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Mail
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            return <span>{row.getValue("mail")}</span>;
        },
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => {
            return (
                <Button
                    onClick={() => {
                        column.toggleSorting(column.getIsSorted() === "asc");
                    }}
                    variant="ghost"
                >
                    Aktiv?
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const active = row.getValue<boolean>("isActive");
            return active ? <CheckCircle2Icon className="text-green-500" /> : <BanIcon className="text-red-500" />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <UserActionCell user={row.original} />;
        },
    },
];
