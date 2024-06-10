"use client";

import { insertSensorValue } from "@/actions/sensors";
import { useSensorContext } from "@/hooks/sensor-hook";
import { addSensorValueSchema } from "@/lib/schema/sensor";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@energyleaf/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@energyleaf/ui/dialog";
import { Button } from "@energyleaf/ui/button";
import { Input } from "@energyleaf/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export default function SensorAddValueDialog() {
    const sensorContext = useSensorContext();
    const form = useForm<z.infer<typeof addSensorValueSchema>>({
        resolver: zodResolver(addSensorValueSchema),
        defaultValues: {
            value: 0,
        },
    });

    function onSubmit(data: z.infer<typeof addSensorValueSchema>) {
        if (data.value <= 0) {
            return;
        }

        if (!sensorContext.sensor) {
            return;
        }

        toast.promise(insertSensorValue(sensorContext.sensor.id, data.value), {
            loading: "Wert wird hinzugefügt...",
            success: (_) => {
                form.reset();
                sensorContext.setAddValueDialogOpen(false);
                sensorContext.setSensor(undefined);
                return "Wert wurde hinzugefügt";
            },
            error: "Fehler beim Hinzufügen des Wertes",
        });
    }

    return (
        <Dialog
            onOpenChange={(value) => {
                sensorContext.setAddValueDialogOpen(value);
                if (!value) {
                    form.reset();
                    sensorContext.setSensor(undefined);
                }
            }}
            open={sensorContext.addValueDialogOpen}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sensorwert hinzufügen</DialogTitle>
                    <DialogDescription>
                        Füge einen neuen Sensorwert hinzu, hiermit setzt du den neuen Startwert für den Sensor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wert</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-4">
                            <Button type="submit">Hinzufügen</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
