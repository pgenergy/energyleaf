"use client";

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
import {useUserContext} from "@/hooks/user-hook";
import {useTransition} from "react";
import {toast} from "sonner";
import {deleteUser} from "@/actions/user";

export function UserDeleteDialog() {
    const userContext = useUserContext();
    const [pending, startTransition] = useTransition();

    if (!userContext.user) {
        return null;
    }

    const user = userContext.user;

    function cancel() {
        userContext.setDeleteDialogOpen(false);
        userContext.setUser(undefined);
    }

    function deleteUserAction() {
        startTransition(() => {
            toast.promise(
                async() => deleteUser(user.id),
                {
                    loading: "Nutzer wird gelöscht...",
                    success: "Nutzer wurde erfolgreich gelöscht.",
                    error: "Nutzer konnte aufgrund eines Fehlers nicht gelöscht werden.",
                })
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                userContext.setDeleteDialogOpen(value);
                userContext.setUser(undefined);
            }}
            open={userContext.deleteDialogOpen}
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
                        className="bg-destructive text-destructive-foreground"
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