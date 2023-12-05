'use client';

import { createDevice } from "@/actions/device";
import { deviceSchema } from "@/lib/schema/device";
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@energyleaf/ui";
import { toast } from "@energyleaf/ui/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface Props {
    userId: string;
    onInteract: () => void;
}

export default function CreateDeviceForm({ onInteract, userId }: Props) {
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema)
    });

    async function onSubmit(data: z.infer<typeof deviceSchema>) {
        try {
            await createDevice(data, userId);
            toast({
                title: "Erfolgreich aktualisiert",
                description: "Deine Daten wurden erfolgreich aktualisiert",
            });
        } catch (e) {
            toast({
                title: "Fehler beim aktualisieren",
                description: "Deine Daten konnten nicht aktualisiert werden",
                variant: "destructive",
            });
        }

        onInteract();
    }

    function onAbort() {
        onInteract();
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} onAbort={onAbort}>
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
                    <Button type="submit">
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}