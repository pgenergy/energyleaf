"use client";

import { getDevicesByPeak, getDevicesByUser, updateDevicesForPeak } from "@/actions/peak";
import { type deviceSchema, peakSchema } from "@/lib/schema/peak";
import type { DefaultActionReturn } from "@energyleaf/lib";
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    MultiSelect,
    type Option,
} from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    userId: string;
    sensorDataId: string;
    onInteract: () => void;
}

const deviceSchemaToOption = (devices: z.infer<typeof deviceSchema>[]): Option[] =>
    devices.map((device) => ({
        value: device.id.toString(),
        label: device.name,
    }));

const optionToDeviceSchema = (option: Option): z.infer<typeof deviceSchema> => ({
    id: Number(option.value),
    name: option.label,
});

export function EnergyPeakDeviceAssignmentForm({ userId, sensorDataId, onInteract }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ["selectedDevices"],
        queryFn: () => getDevicesByPeak(sensorDataId),
    });

    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            device: [],
        },
    });

    useEffect(() => {
        if (data) {
            form.setValue("device", data);
        }
    }, [data, form]);

    async function addOrUpdatePeakCallback(data: z.infer<typeof peakSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateDevicesForPeak(data, sensorDataId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof peakSchema>) {
        track("assignEnergyPeakToDevice()");
        toast.promise(addOrUpdatePeakCallback(data), {
            loading: "Peak zuweisen...",
            success: "Erfolgreich zugewiesen",
            error: (err: Error) => err.message,
        });

        onInteract();
    }

    function onAbort() {
        onInteract();
    }

    async function loadOptions(search: string) {
        const devices = await getDevicesByUser(userId, search);
        return devices.map((device) => ({
            label: device.name,
            value: device.id.toString(),
        }));
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="device"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>Gerät</FormLabel>
                                <FormControl>
                                    <MultiSelect
                                        loadOptions={loadOptions}
                                        onSelected={(values) => {
                                            field.onChange(values.map(optionToDeviceSchema));
                                        }}
                                        values={deviceSchemaToOption(field.value)}
                                        isLoading={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
}
