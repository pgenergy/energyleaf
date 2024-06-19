"use client";

import { deleteSensor } from "@/actions/sensors";
import { useSensorContext } from "@/hooks/sensor-hook";
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
import { buttonVariants } from "@energyleaf/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function SensorDeleteDialog() {
    const sensorContext = useSensorContext();
    const [pending, startTransition] = useTransition();

    if (!sensorContext.sensor) {
        return null;
    }

    function cancel() {
        sensorContext.setDeleteDialogOpen(false);
        sensorContext.setSensor(undefined);
    }

    async function deleteSensorCallback(sensorId: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await deleteSensor(sensorId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function deleteSensorAction() {
        startTransition(() => {
            if (!sensorContext.sensor) {
                return;
            }
            toast.promise(deleteSensorCallback(sensorContext.sensor.id), {
                loading: "Sensor wird gelöscht...",
                success: () => {
                    sensorContext.setDeleteDialogOpen(false);
                    sensorContext.setSensor(undefined);
                    return "Sensor wurde erfolgreich gelöscht.";
                },
                error: (err: Error) => err.message,
            });
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                sensorContext.setDeleteDialogOpen(value);
                sensorContext.setSensor(undefined);
            }}
            open={sensorContext.deleteDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sensor löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Sind Sie sicher, dass Sie den Sensor {`"${sensorContext.sensor.clientId}"`} löschen möchten?
                        Hierbei werden auch alle Daten gelöscht, die mit diesem Sensor verknüpft sind.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        disabled={pending}
                        onClick={deleteSensorAction}
                    >
                        Sensor löschen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
