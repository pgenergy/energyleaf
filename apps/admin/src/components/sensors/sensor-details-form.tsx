import { createSensor, isSensorRegistered, updateSensor } from "@/actions/sensors";
import { addSensorSchema } from "@/lib/schema/sensor";
import type { SensorInsertType, SensorSelectType } from "@energyleaf/db/types";
import { SensorType, SensorTypeMap } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { Textarea } from "@energyleaf/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

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
        },
    });

    async function updateSensorCallback(sensorId: string, data: Partial<SensorInsertType>) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await updateSensor(sensorId, data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    async function createSensorCallback(mac: string, sensorType: SensorType, script: string | undefined) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await createSensor(mac, sensorType, script);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof addSensorSchema>) {
        if (sensor) {
            const updateData = {
                clientId: data.macAddress,
                sensorType: data.sensorType,
                script: data.script,
            };
            toast.promise(updateSensorCallback(sensor.id, updateData), {
                loading: "Laden...",
                success: (_) => {
                    onCallback();
                    return "Erfolgreich aktualisiert";
                },
                error: (err: Error) => err.message,
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

                await createSensorCallback(data.macAddress, data.sensorType, data.script);
            },
            {
                loading: "Laden...",
                success: (_) => {
                    onCallback();
                    return "Erfolgreich hinzugefügt";
                },
                error: (err: Error) => err.message,
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
