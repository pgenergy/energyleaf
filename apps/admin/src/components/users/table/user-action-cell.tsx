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
import {useTransition} from "react";
import {toast} from "sonner";
import {setUserActive} from "@/actions/user";

interface Props {
    user: UserTableType;
}

export default function UserActionCell({ user }: Props) {
    const [pending, startTransition] = useTransition();
    const router = useRouter()

    function openDetails() {
        router.push(`/users/${user.id}`)
    }

    function toggleActive() {
        startTransition(() => {
            const operation = user.active ? "deaktiviert" : "aktiviert";

            toast.promise(
                async () => await setUserActive(user.id, !user.active),
                {
                    loading: `User wird ${operation}...`,
                    success: () => {
                        return `User wurde erfolgreich ${operation}.`;
                    },
                    error: `User konnte aufgrund eines Fehlers nicht ${operation} werden.`,
                }
            );
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
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                    disabled={pending}
                    onClick={openDetails}
                >
                    <InfoIcon className="h-4 w-4" />
                    Details
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                    disabled={pending}
                    onClick={toggleActive}
                >
                    {(user.active ? <BanIcon className="h-4 w-4" /> : <CheckCircle2Icon className="h-4 w-4" />)}
                    {user.active ? "Deaktivieren" : "Aktivieren"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                    disabled={pending}
                >
                    <KeyIcon className="h-4 w-4" />
                    Passwort zurücksetzen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2 text-destructive"
                    disabled={pending}
                >
                    <TrashIcon className="h-4 w-4" />
                    Löschen
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}