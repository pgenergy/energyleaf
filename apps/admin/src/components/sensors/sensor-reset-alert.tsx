"use client";

import { resetSensorValues } from "@/actions/sensors";
import { useSensorContext } from "@/hooks/sensor-hook";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@energyleaf/ui";
import { type MouseEvent, useTransition } from "react";
import { toast } from "sonner";

export default function SensorResetAlert() {
    const sensorContext = useSensorContext();
    const [pending, startTransition] = useTransition();

    function onReset(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const sensor = sensorContext.sensor;
        if (!sensor) {
            return;
        }

        startTransition(() => {
            toast.promise(resetSensorValues(sensor.clientId), {
                loading: "Sensor wird zurückgesetzt...",
                success: () => {
                    sensorContext.setSensorResetDialogOpen(false);
                    sensorContext.setSensor(undefined);
                    return "Sensor wurde zurückgesetzt";
                },
                error: "Fehler beim Zurücksetzen des Sensors",
            });
        });
    }

    return (
        <AlertDialog
            open={sensorContext.sensorResetDialogOpen}
            onOpenChange={(open) => {
                sensorContext.setSensorResetDialogOpen(open);
                if (!open) {
                    sensorContext.setSensor(undefined);
                }
            }}
        >
            <AlertDialogHeader>
                <AlertDialogTitle>Sensor zurücksetzen</AlertDialogTitle>
                <AlertDialogDescription>
                    Diese Aktion entfernt alle Werte die diesem Sensor zugeordnet sind. Das beinhaltet alle Token,
                    Werte, Skripte sowie der aktuell Nutzer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel
                    disabled={pending}
                    onClick={() => {
                        sensorContext.setSensorResetDialogOpen(false);
                        sensorContext.setSensor(undefined);
                    }}
                >
                    Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction disabled={pending} onClick={onReset}>
                    Zurücksetzen
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialog>
    );
}
