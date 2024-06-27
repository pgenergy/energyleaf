"use client";

import { resetUserPassword } from "@/actions/auth";
import { useUserContext } from "@/hooks/user-hook";
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
import { useTransition } from "react";
import { toast } from "sonner";

export function UserResetPasswordDialog() {
    const [pending, startTransition] = useTransition();
    const context = useUserContext();

    if (!context.user) {
        return null;
    }

    const user = context.user;

    function cancel() {
        context.setPasswordResetDialogOpen(false);
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
                context.setPasswordResetDialogOpen(value);
                context.setUser(undefined);
            }}
            open={context.passwordResetDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Passwort zurücksetzen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sind Sie sicher, dass Sie dem Nutzer {`"${user.username}"`} (ID: {user.id}) eine E-Mail zum
                        Zurücksetzen des Passworts senden möchten?
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
