"use client";

import { resetSensorValues } from "@/actions/sensors";
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
import { type MouseEvent, useTransition } from "react";
import { toast } from "sonner";

export default function SensorResetAlert() {
    const sensorContext = useSensorContext();
    const [pending, startTransition] = useTransition();

    async function resetSensorValuesCallback(clientId: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await resetSensorValues(clientId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onReset(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const sensor = sensorContext.sensor;
        if (!sensor) {
            return;
        }

        startTransition(() => {
            toast.promise(resetSensorValuesCallback(sensor.clientId), {
                loading: "Sensor wird zurückgesetzt...",
                success: () => {
                    sensorContext.setSensorResetDialogOpen(false);
                    sensorContext.setSensor(undefined);
                    return "Sensor wurde zurückgesetzt";
                },
                error: (err: Error) => err.message,
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
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sensor zurücksetzen</AlertDialogTitle>
                    <AlertDialogDescription>
                        Diese Aktion entfernt alle Werte, die diesem Sensor zugeordnet sind. Das beinhaltet alle Token,
                        Werte, Skripte sowie den aktuellen Nutzer.
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
            </AlertDialogContent>
        </AlertDialog>
    );
}
