import { createDevice, updateDevice } from "@/actions/device";
import { deviceSchema } from "@/lib/schema/device";
import { DeviceCategory } from "@energyleaf/db/types";
import type { DeviceSelectType } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@energyleaf/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    device?: DeviceSelectType;
    onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            deviceName: device?.name ?? "",
            category: device?.category ? (device.category as keyof typeof DeviceCategory) : "",
        },
    });

    async function createDeviceCallback(data: z.infer<typeof deviceSchema>) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await createDevice(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    async function updateDeviceCallback(data: z.infer<typeof deviceSchema>, id: number) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await updateDevice(data, id);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    const onSubmit = (data: z.infer<typeof deviceSchema>) => {
        toast.promise(device ? updateDeviceCallback(data, device.id) : createDeviceCallback(data), {
            loading: device ? "Speichern..." : "Erstellen...",
            success: () => {
                onCallback();
                return device ? "Gerät aktualisiert." : "Gerät hinzugefügt.";
            },
            error: (err: Error) => err.message,
        });
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategorie auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DeviceCategory).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
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
                <Button className="mt-4" disabled={device !== undefined && !form.formState.isDirty} type="submit">
                    Speichern
                </Button>
            </form>
        </Form>
    );
}
