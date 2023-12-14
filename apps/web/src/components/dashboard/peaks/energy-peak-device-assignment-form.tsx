import { addOrUpdatePeak } from "@/actions/peak";
import { peakSchema } from "@/lib/schema/peak";
import { Button, Form, FormField, FormItem, FormLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";
import { toast } from "@energyleaf/ui/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
    devices: { id: number; userId: number; name: string; created: Date | null; }[];
    initialValues: z.infer<typeof peakSchema>;
    sensorDataId: number;
    onInteract: () => void;
}

export async function EnergyPeakDeviceAssignmentForm({ devices, initialValues, sensorDataId, onInteract }: Props) {
    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            ...initialValues
        },
    });

    async function onSubmit(data: z.infer<typeof peakSchema>) {
        try {
            await addOrUpdatePeak(data, sensorDataId)
            toast({
                title: "Erfolgreich zugewiesen",
                description: "Dem Peak wurde erfolgreich das Gerät zugewiesen.",
            });
        } catch (e) {
            toast({
                title: "Fehler beim Zuweisen",
                description: "Das Gerät konnte dem Peak nicht zugewiesen werden.",
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
                    name="deviceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gerät</FormLabel>
                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gerät wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {devices?.map((device) => (
                                        <SelectItem key={device.id} value={device.id.toString()}>
                                            {device.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
    )
}