"use client";

import { createSensor, isSensorRegistered, updateSensor } from "@/actions/sensors";
import { addSensorSchema } from "@/lib/schema/sensor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import type { SensorSelectType } from "@energyleaf/db/types";
import { SensorType, SensorTypeMap } from "@energyleaf/db/types";
import {
    Button,
    Form,
    FormControl,
    FormDescription,
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
    Textarea,
} from "@energyleaf/ui";

interface Props {
    sensor?: SensorSelectType;
    onCallback: () => void;
}

export default function SensorDetailsForm({ onCallback, sensor }: Props) {
    const form = useForm<z.infer<typeof addSensorSchema>>({
        resolver: zodResolver(addSensorSchema),
        defaultValues: {
            macAddress: sensor?.clientId ?? "",
            sensorType: sensor?.sensorType ?? SensorType.Electricity,
            script: sensor?.script ?? "",
            currentValue: sensor?.currentValue ?? 0,
        },
    });

    function onSubmit(data: z.infer<typeof addSensorSchema>) {
        if (sensor) {
            const updateData = {
                clientId: data.macAddress,
                sensorType: data.sensorType,
                script: data.script,
                currentValue: data.currentValue,
            };
            toast.promise(updateSensor(sensor.id, updateData), {
                loading: "Laden...",
                success: (_) => {
                    onCallback();
                    return `Erfolgreich aktualisiert`;
                },
                error: `Fehler beim Aktualisieren`,
            });

            return;
        }
        toast.promise(
            async () => {
                if (await isSensorRegistered(data.macAddress)) {
                    form.setError("macAddress", {
                        message: "MAC-Adresse existiert bereits",
                    });
                    throw new Error("MAC-Adresse existiert bereits");
                }

                await createSensor(data.macAddress, data.sensorType, data.script, data.currentValue);
            },
            {
                loading: "Laden...",
                success: (_) => {
                    onCallback();
                    return `Erfolgreich hinzugefügt`;
                },
                error: `Fehler beim Hinzufügen`,
            },
        );
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="macAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>MAC-Adresse</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sensorType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Typ</FormLabel>
                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sensor-Typ wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(SensorType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {SensorTypeMap[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="script"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Skript</FormLabel>
                            <FormDescription>Dieses Skript ist optional</FormDescription>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-row justify-end">
                    <Button disabled={!form.formState.isDirty} type="submit">
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
