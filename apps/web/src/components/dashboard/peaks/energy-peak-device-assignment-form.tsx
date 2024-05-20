"use client";

import { updateDevicesForPeak } from "@/actions/peak";
import {type deviceSchema, peakSchema} from "@/lib/schema/peak";
import type { DeviceSelectType } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, MultiSelect, type Option
} from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {useState} from "react";

interface Props {
    devices: DeviceSelectType[];
    initialValues: z.infer<typeof peakSchema>;
    sensorId: string;
    timestamp: string;
    onInteract: () => void;
}

const deviceSchemaToOption = (devices: z.infer<typeof deviceSchema>[]): Option[] => devices.map((device) => ({
    label: device.name,
    value: device.id.toString()
}));

const optionToDeviceSchema = (option: Option): z.infer<typeof deviceSchema> => ({
    id: Number(option.value),
    name: option.label
});

export function EnergyPeakDeviceAssignmentForm({ devices, initialValues, sensorId, timestamp, onInteract }: Props) {
    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            ...initialValues,
        },
    });

    async function addOrUpdatePeakCallback(data: z.infer<typeof peakSchema>, sensorId: string, timestamp: string) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateDevicesForPeak(data, sensorId, timestamp);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof peakSchema>) {
        track("assignEnergyPeakToDevice()");
        toast.promise(addOrUpdatePeakCallback(data, sensorId, timestamp), {
            loading: "Peak zuweisen...",
            success: "Erfolgreich zugewiesen",
            error: (err: Error) => err.message,
        });

        onInteract();
    }

    function onAbort() {
        onInteract();
    }

    const options: Option[] = devices.map((device) => ({
       label: device.name,
       value: device.id.toString()
    }));

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="device"
                    render={({ field }) => {
                        console.log(field.value)
                        return (
                        <FormItem>
                            <FormLabel>Gerät</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={options}
                                    onSelected={(values) => { field.onChange(values.map(optionToDeviceSchema)) }}
                                    values={deviceSchemaToOption(field.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
}
