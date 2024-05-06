"use client";

import { deleteDevice } from "@/actions/device";
import { useDeviceContext } from "@/hooks/device-hook";
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
    buttonVariants,
} from "@energyleaf/ui";
import { track } from "@vercel/analytics";
import { useTransition } from "react";
import { toast } from "sonner";

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

    async function deleteDeviceCallback(id: number) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await deleteDevice(id);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function deleteDeviceAction() {
        startTransition(() => {
            track("deleteDevice()");
            if (!deviceContext.device) {
                return;
            }
            toast.promise(deleteDeviceCallback(deviceContext.device.id), {
                loading: "Gerät wird gelöscht...",
                success: () => {
                    deviceContext.setDeleteDialogOpen(false);
                    deviceContext.setDevice(undefined);
                    return "Gerät wurde erfolgreich gelöscht.";
                },
                error: (err: Error) => err.message,
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
                        Sind Sie sicher, dass Sie das Gerät {`"${deviceContext.device.name}"`} löschen möchten? Hierbei
                        werden auch alle Daten gelöscht, die mit diesem Gerät verknüpft sind.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
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
