"use client";

import { addOrUpdatePeak } from "@/actions/peak";
import { peakSchema } from "@/lib/schema/peak";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import type { DeviceSelectType } from "@energyleaf/db/types";
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@energyleaf/ui";

interface Props {
    devices: DeviceSelectType[];
    initialValues: z.infer<typeof peakSchema>;
    sensorId: string;
    timestamp: string;
    onInteract: () => void;
}

export function EnergyPeakDeviceAssignmentForm({ devices, initialValues, sensorId, timestamp, onInteract }: Props) {
    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            ...initialValues,
        },
    });

    function onSubmit(data: z.infer<typeof peakSchema>) {
        track("assignEnergyPeakToDevice()");
        toast.promise(addOrUpdatePeak(data, sensorId, timestamp), {
            loading: "Peak zuweisen...",
            success: `Erfolgreich zugewiesen`,
            error: `Das Gerät konnte dem Peak nicht zugewiesen werden.`,
        });

        onInteract();
    }

    function onAbort() {
        onInteract();
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="deviceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gerät</FormLabel>
                            <FormControl>
                                <Select defaultValue={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Gerät wählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {devices.map((device) => (
                                            <SelectItem key={device.id} value={device.id.toString()}>
                                                {device.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
}
