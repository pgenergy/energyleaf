"use client";

import { useTransition } from "react";
import { deleteSensor } from "@/actions/sensors";
import { useSensorContext } from "@/hooks/sensor-hook";
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

    function deleteSensorAction() {
        startTransition(() => {
            if (!sensorContext.sensor) {
                return;
            }
            toast.promise(deleteSensor(sensorContext.sensor.id), {
                loading: "Sensor wird gelöscht...",
                success: () => {
                    sensorContext.setDeleteDialogOpen(false);
                    sensorContext.setSensor(undefined);
                    return "Sensor wurde erfolgreich gelöscht.";
                },
                error: "Beim Löschen des Sensors ist ein Fehler aufgetreten.",
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
                        Bist du sicher, dass du den Sensor {`"${sensorContext.sensor.clientId}"`} löschen möchtest?
                        Hierbei werden auch alle Daten gelöscht, die mit diesem Sensor verknüpft sind.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} onClick={cancel}>
                        Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
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
