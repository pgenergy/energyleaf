"use client";

import { deleteUser } from "@/actions/user";
import { useUserContext } from "@/hooks/user-hook";
import type { DefaultActionReturn } from "@energyleaf/lib";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@energyleaf/ui/alert-dialog";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
    onSuccess?: () => void;
}

export function UserDeleteDialog({ onSuccess }: Props) {
    const context = useUserContext();
    const [pending, startTransition] = useTransition();

    if (!context.user) {
        return null;
    }

    const user = context.user;

    function cancel() {
        context.setDeleteDialogOpen(false);
        context.setUser(undefined);
    }

    async function deleteUserCallback(userId: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await deleteUser(userId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function deleteUserAction() {
        startTransition(() => {
            toast.promise(deleteUserCallback(user.id), {
                loading: "Nutzer wird gelöscht...",
                success: () => {
                    onSuccess?.();
                    return "Nutzer wurde erfolgreich gelöscht.";
                },
                error: (err: Error) => err.message,
            });
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                context.setDeleteDialogOpen(value);
                context.setUser(undefined);
            }}
            open={context.deleteDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Nutzer löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sind Sie sicher, dass Sie den Nutzer {`"${user.username}"`} (ID: {user.id}) löschen möchten?
                        Dadurch werden alle personenbezogenen Daten des Nutzers gelöscht.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={pending}
                        onClick={deleteUserAction}
                    >
                        Nutzer löschen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
