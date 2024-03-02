"use client";

import { useTransition } from "react";
import { deleteUser } from "@/actions/user";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@energyleaf/ui";
import { useUserContext } from "@/hooks/user-hook";

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

    function deleteUserAction() {
        startTransition(() => {
            toast.promise(deleteUser(user.id), {
                loading: "Nutzer wird gelöscht...",
                success: () => {
                    onSuccess?.();
                    return "Nutzer wurde erfolgreich gelöscht.";
                },
                error: "Nutzer konnte aufgrund eines Fehlers nicht gelöscht werden.",
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
                        Bist du sicher, dass du den Nutzer {`"${user.username}"`} (ID: {user.id}) löschen möchtest?
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
