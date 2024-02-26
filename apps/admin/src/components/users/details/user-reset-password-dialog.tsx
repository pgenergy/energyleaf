"use client";

import { useTransition } from "react";
import { resetUserPassword } from "@/actions/auth";
import { useUserDetailsContext } from "@/hooks/user-detail-hook";
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

export function UserResetPasswordDialog() {
    const [pending, startTransition] = useTransition();
    const context = useUserDetailsContext();

    if (!context.user) {
        return null;
    }

    const user = context.user;

    function cancel() {
        context.setResetPasswordDialogOpen(false);
        context.setUser(undefined);
    }

    function resetPasswordAction() {
        startTransition(() => {
            toast.promise(resetUserPassword(user.id), {
                loading: "E-Mail wird gesendet...",
                success: "E-Mail wurde erfolgreich gesendet.",
                error: "E-Mail konnte aufgrund eines Fehlers nicht gesendet werden.",
            });
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                context.setResetPasswordDialogOpen(value);
                context.setUser(undefined);
            }}
            open={context.resetPasswordDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Passwort zurücksetzen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bist du sicher, dass du dem Nutzer {`"${user.username}"`} (ID: {user.id}) eine E-Mail zum
                        Zurücksetzen des Passworts senden möchtest?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={pending}
                        onClick={resetPasswordAction}
                    >
                        Passwort zurücksetzen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
