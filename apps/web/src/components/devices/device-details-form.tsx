"use client";

import { useState } from "react";
import { createDevice, updateDevice } from "@/actions/device";
import { DeviceCategory, deviceSchema } from "@/lib/schema/device";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@energyleaf/ui";

interface Props {
    device?: { id: number; name: string; category?: DeviceCategory };
    onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            deviceName: device?.name ?? "",
            category: device?.category,
        },
    });

    const [categoryChanged, setCategoryChanged] = useState(false);

    const onSubmit = (data: z.infer<typeof deviceSchema>) => {
        if (typeof data.category === "undefined") {
            toast.error("Kategorie ist erforderlich");
            return;
        }
        toast.promise(device ? updateDevice(data, device.id) : createDevice(data), {
            loading: device ? "Speichern..." : "Erstellen...",
            success: () => {
                track(device ? "updateDevice" : "createDevice");
                onCallback();
                return device ? "Gerät aktualisiert." : "Gerät hinzugefügt.";
            },
            error: "Es ist ein Fehler aufgetreten.",
        });
    };

    const handleCategoryChange = (value: string) => {
        const categoryKey = Object.keys(DeviceCategory).find((key) => DeviceCategory[key] === value);
        if (categoryKey && Object.values(DeviceCategory).includes(value as DeviceCategory)) {
            form.setValue("category", value as DeviceCategory);
            setCategoryChanged(true);
        }
    };

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
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kategorie</FormLabel>
                            <FormControl>
                                <Select onValueChange={handleCategoryChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategorie auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DeviceCategory).map(([key, value]) => (
                                            <SelectItem key={key} value={value}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    className="mt-4"
                    disabled={device !== undefined && !form.formState.isDirty && !categoryChanged}
                    type="submit"
                >
                    Speichern
                </Button>
            </form>
        </Form>
    );
}
