"use client";

import { createDevice, updateDevice } from "@/actions/device";
import { deviceSchema } from "@/lib/schema/device";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@energyleaf/ui";

interface Props {
    device?: { id: number; name: string };
    onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            deviceName: device?.name ?? "",
        },
    });

    function onSubmit(data: z.infer<typeof deviceSchema>) {
        const operation = device ? "aktualisiert" : "hinzugefügt";
        toast.promise(
            async () => {
                if (!device) {
                    await createDevice(data);
                } else {
                    await updateDevice(data, Number(device.id));
                }
            },
            {
                loading: "Laden...",
                success: `Erfolgreich ${operation}`,
                error: `Fehler beim ${!device ? "Hinzufügen" : "Aktualisieren"}`,
            },
        );

        onCallback();
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="deviceName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gerätename</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row justify-end">
                    <Button disabled={device && !form.formState.isDirty} type="submit">
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
