"use client";

import { useTransition } from "react";
import { deleteDevice } from "@/actions/device";
import { useDeviceContext } from "@/hooks/device-hook";
import { track } from "@vercel/analytics";
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

export function DeviceDeleteDialog() {
    const deviceContext = useDeviceContext();
    const [pending, startTransition] = useTransition();

    if (!deviceContext.device) {
        return null;
    }

    function cancel() {
        deviceContext.setDeleteDialogOpen(false);
        deviceContext.setDevice(undefined);
    }

    function deleteDeviceAction() {
        startTransition(() => {
            track("deleteDevice()");
            if (!deviceContext.device) {
                return;
            }
            toast.promise(deleteDevice(deviceContext.device.id), {
                loading: "Gerät wird gelöscht...",
                success: () => {
                    deviceContext.setDeleteDialogOpen(false);
                    deviceContext.setDevice(undefined);
                    return "Gerät wurde erfolgreich gelöscht.";
                },
                error: "Beim Löschen des Gerätes ist ein Fehler aufgetreten.",
            });
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                deviceContext.setDeleteDialogOpen(value);
                deviceContext.setDevice(undefined);
            }}
            open={deviceContext.deleteDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Gerät löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bist du sicher, dass du das Gerät {`"${deviceContext.device.name}"`} löschen möchtest? Hierbei
                        werden auch alle Daten gelöscht, die mit diesem Gerät verknüpft sind.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        disabled={pending}
                        onClick={deleteDeviceAction}
                    >
                        Gerät löschen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
