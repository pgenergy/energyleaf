"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
    Input, Select, SelectContent,
    SelectItem, SelectTrigger, SelectValue
} from "@energyleaf/ui";
import {addSensorSchema} from "@/lib/schema/sensor";
import {SensorType} from "@energyleaf/db/schema";

interface Props {
    device?: { id: number; name: string };
    onCallback: () => void;
}

export default function SensorDetailsForm({ onCallback }: Props) {
    const form = useForm<z.infer<typeof addSensorSchema>>({
        resolver: zodResolver(addSensorSchema)
    });

    function onSubmit(data: z.infer<typeof addSensorSchema>) {
        toast.promise(
            async () => {
                await new Promise((resolve) => {setTimeout(resolve, 1000)});
            },
            {
                loading: "Laden...",
                success: `Erfolgreich hinzugefügt`,
                error: `Fehler beim Hinzufügen`,
            },
        );

        onCallback();
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
                    name="id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID</FormLabel>
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
                            <FormLabel>ID</FormLabel>
                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gerät wählen" />
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
