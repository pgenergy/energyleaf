
"use client";

import {BanIcon, CheckCircle2Icon, InfoIcon, KeyIcon, LockIcon, MoreVerticalIcon, TrashIcon} from "lucide-react";

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui";
import type {UserTableType} from "@/components/users/table/users-table-columns";
import {useRouter} from "next/navigation";

interface Props {
    user: UserTableType;
}

export default function UserActionCell({ user }: Props) {
    const router = useRouter()
    function openDetails() {
        router.push(`/users/${user.id}`)
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
                    className="flex cursor-pointer flex-row gap-2"
                    onClick={openDetails}
                >
                    <InfoIcon className="h-4 w-4" />
                    Details
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                >
                    {(user.active ? <BanIcon className="h-4 w-4" /> : <CheckCircle2Icon className="h-4 w-4" />)}
                    {user.active ? "Deaktivieren" : "Aktivieren"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                >
                    <KeyIcon className="h-4 w-4" />
                    Passwort zurücksetzen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2 text-destructive"
                >
                    <TrashIcon className="h-4 w-4" />
                    Löschen
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}