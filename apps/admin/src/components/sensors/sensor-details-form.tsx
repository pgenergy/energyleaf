"use client";

import { createSensor, isSensorRegistered } from "@/actions/sensors";
import { addSensorSchema } from "@/lib/schema/sensor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { SensorType } from "@energyleaf/db/schema";
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
    device?: { id: number; name: string };
    onCallback: () => void;
}

export default function SensorDetailsForm({ onCallback }: Props) {
    const form = useForm<z.infer<typeof addSensorSchema>>({
        resolver: zodResolver(addSensorSchema),
    });

    function onSubmit(data: z.infer<typeof addSensorSchema>) {
        toast.promise(
            async () => {
                if (await isSensorRegistered(data.macAddress)) {
                    form.setError("macAddress", {
                        message: "MAC-Adresse existiert bereits",
                    });
                    throw new Error("MAC-Adresse existiert bereits");
                }

                await createSensor(data.macAddress, data.sensorType);
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

    const sensorTypeDescriptions: { [key in SensorType]: string } = {
        [SensorType.Electricity]: "Strom",
        [SensorType.Gas]: "Gas",
    };

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
                                            {sensorTypeDescriptions[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
