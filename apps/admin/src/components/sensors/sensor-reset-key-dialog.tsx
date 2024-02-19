"use client";

import { useTransition } from "react";

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
import {useSensorContext} from "@/hooks/sensor-hook";
import {toast} from "sonner";
import {resetSensorKey} from "@/actions/sensors";

export function SensorResetKeyDialog() {
    const sensorContext = useSensorContext();
    const [pending, startTransition] = useTransition();

    if (!sensorContext.sensor) {
        return null;
    }

    function cancel() {
        sensorContext.setResetKeyDialogOpen(false);
        sensorContext.setSensor(undefined);
    }

    function deleteDeviceAction() {
        startTransition(() => {
            if (!sensorContext.sensor) {
                return;
            }

            toast.promise(resetSensorKey(sensorContext.sensor.id), {
                loading: "Key wird zurückgesetzt...",
                success: () => {
                    sensorContext.setResetKeyDialogOpen(false);
                    sensorContext.setSensor(undefined);
                    return "Sensor-Key erfolgreich zurückgesetzt.";
                },
                error: "Beim Zurücksetzen des Sensor-Keys ist ein Fehler aufgetreten.",
            });
        });
    }

    return (
        <AlertDialog
            onOpenChange={(value) => {
                sensorContext.setAddDialogOpen(value);
                sensorContext.setSensor(undefined);
            }}
            open={sensorContext.resetKeyDialogOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sensor-Key zurücksetzen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bist du sicher, dass du den Key vom Sensor mit der MAC-Adresse
                        {`"${sensorContext.sensor.clientId}"`} löschen möchtest? Dadurch wird der zugeordnete Benutzer
                        zum Sensor entfernt und kann von einem anderen Benutzer verwendet werden.
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
                        Key zurücksetzen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
