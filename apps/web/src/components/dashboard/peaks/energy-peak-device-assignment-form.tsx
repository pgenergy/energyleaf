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
import { track } from "@vercel/analytics";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    userId: string;
    sensorId: string;
    timestamp: string;
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

export function EnergyPeakDeviceAssignmentForm({ userId, sensorId, timestamp, onInteract }: Props) {
    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            device: [],
        },
    });
    const [loadPreselection, setLoadPreselection] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function getSelectedDevices() {
            try {
                setLoadPreselection(true);
                const devices = await getDevicesByPeak(sensorId, timestamp);

                if (!ignore) {
                    form.setValue(
                        "device",
                        devices.map((device) => ({
                            id: device.id,
                            name: device.name,
                        })),
                    );
                }
            } finally {
                setLoadPreselection(false);
            }
        }

        getSelectedDevices();

        return () => {
            ignore = true;
        };
    }, [form.setValue, sensorId, timestamp]);

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
                                        isLoading={loadPreselection}
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
