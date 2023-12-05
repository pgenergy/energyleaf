import { createPeak } from "@/actions/peak";
import { peakSchema } from "@/lib/schema/peak";
import { Button, Form, FormField, FormItem, FormLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui";
import { toast } from "@energyleaf/ui/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
    devices: { id: number; userId: number; name: string; created: Date | null; }[];
    sensorDataId: number;
    onInteract: () => void;
}

export async function EnergyPeakDeviceAssignmentForm({ devices, sensorDataId, onInteract }: Props) {
    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema)
    });

    async function onSubmit(data: z.infer<typeof peakSchema>) {
        try {
            await createPeak(data, sensorDataId)
            toast({
                title: "Erfolgreich hinzugefügt",
                description: "Der Peak wurde erfolgreich hinzugefügt",
            });
        } catch (e) {
            toast({
                title: "Fehler beim Hinzufügen",
                description: "Der Peak konnte nicht hinzugefügt werden",
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
                            <Select onValueChange={field.onChange}>
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