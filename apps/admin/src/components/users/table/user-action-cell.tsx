"use client";

import { resetUserPassword } from "@/actions/auth";
import { setUserActive, setUserAdmin } from "@/actions/user";
import { useUserContext } from "@/hooks/user-hook";
import type { UserSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui/dropdown-menu";
import {
    BanIcon,
    CheckCircle2Icon,
    InfoIcon,
    KeyIcon,
    MoreVerticalIcon,
    TrashIcon,
    UserMinusIcon,
    UserPlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
    user: UserSelectType;
}

export default function UserActionCell({ user }: Props) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const userContext = useUserContext();

    function openDetails() {
        router.push(`/users/${user.id}`);
    }

    function openDeleteDialog() {
        userContext.setUser(user);
        userContext.setDeleteDialogOpen(true);
    }

    function toggleActive() {
        startTransition(() => {
            const operation = user.isActive ? "deaktiviert" : "aktiviert";

            toast.promise(setUserActive(user.id, !user.isActive), {
                loading: `User wird ${operation}...`,
                success: `User wurde erfolgreich ${operation}.`,
                error: `User konnte aufgrund eines Fehlers nicht ${operation} werden.`,
            });
        });
    }

    function toggleIsAdmin() {
        startTransition(() => {
            toast.promise(setUserAdmin(user.id, !user.isAdmin), {
                loading: "User-Rechte werden aktualisiert...",
                success: "User-Rechte wurden erfolgreich aktualisiert.",
                error: "User-Rechte konnten aufgrund eines Fehlers nicht aktualisiert werden.",
            });
        });
    }

    function sendUserForgetPasswordEmail() {
        startTransition(() => {
            toast.promise(resetUserPassword(user.id), {
                loading: "Passwort zurücksetzen Email wird gesendet...",
                success: "Passwort zurücksetzen Email wurde erfolgreich gesendet.",
                error: "Passwort zurücksetzen Email konnte aufgrund eines Fehlers nicht gesendet werden.",
            });
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
                    {user.isActive ? <BanIcon className="h-4 w-4" /> : <CheckCircle2Icon className="h-4 w-4" />}
                    {user.isActive ? "Deaktivieren" : "Aktivieren"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                    disabled={pending}
                    onClick={toggleIsAdmin}
                >
                    {user.isAdmin ? <UserMinusIcon className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
                    {user.isAdmin ? "Adminrechte entziehen" : "Adminrechte geben"}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2"
                    disabled={pending}
                    onClick={sendUserForgetPasswordEmail}
                >
                    <KeyIcon className="h-4 w-4" />
                    Passwort zurücksetzen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer flex-row gap-2 text-destructive"
                    disabled={pending}
                    onClick={openDeleteDialog}
                >
                    <TrashIcon className="h-4 w-4" />
                    Löschen
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
