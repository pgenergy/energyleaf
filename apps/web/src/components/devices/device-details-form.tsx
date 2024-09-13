import { createDevice, updateDevice } from "@/actions/device";
import { deviceSchema } from "@/lib/schema/device";
import type { DefaultActionReturn } from "@energyleaf/lib";
import {
    DeviceCategoryTitles,
    DeviceSuperCategory,
    DeviceSuperCategoryTitles,
    getDeviceCategories,
} from "@energyleaf/postgres/types";
import type { DeviceSelectType } from "@energyleaf/postgres/types";
import {} from "@energyleaf/ui/alert";
import { Button } from "@energyleaf/ui/button";
import { Checkbox } from "@energyleaf/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@energyleaf/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import DeviceCategoryIcon from "./device-category-icon";

interface Props {
    device?: DeviceSelectType;
    onCallback: () => void;
}

export default function DeviceDetailsForm({ device, onCallback }: Props) {
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            deviceName: device?.name ?? "",
            category: device?.category ?? "",
            power: device?.power ?? null,
            isPowerEstimated: device?.isPowerEstimated ?? true,
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
                                        {Object.entries(DeviceSuperCategory).map(([key, value]) => (
                                            <>
                                                <SelectGroup key={key}>
                                                    <SelectLabel className="text-primary">
                                                        {DeviceSuperCategoryTitles[value]}
                                                    </SelectLabel>
                                                    {getDeviceCategories(value).map((category) => (
                                                        <SelectItem key={category} value={category} className="m-3">
                                                            <div className="flex flex-row items-center gap-3">
                                                                <DeviceCategoryIcon category={category} />
                                                                {DeviceCategoryTitles[category]}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                                <SelectSeparator key={key} />
                                            </>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="pb-4" />
                <p className="font-medium text-lg">Leistung (in Watt)</p>
                <FormField
                    control={form.control}
                    name="isPowerEstimated"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={!field.value}
                                    onCheckedChange={(e) => {
                                        field.onChange(!e);
                                        if (!e) {
                                            form.resetField("power");
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormLabel className="text-sm">Leistung manuell festlegen</FormLabel>
                            <Popover>
                                <PopoverTrigger>
                                    <InfoIcon className="h-4 w-4" />
                                </PopoverTrigger>
                                <PopoverContent>
                                    Wenn Sie diese Einstellung aktivieren, wird der angegebene Wert für die Leistung
                                    festgesetzt. Dadurch wird die Leistung des Gerätes nicht mehr auf Basis der
                                    Verbrauchsausschläge geschätzt.
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="power"
                    render={({ field }) => {
                        const isPowerEstimated = form.getValues().isPowerEstimated;
                        return (
                            <FormItem>
                                <FormControl>
                                    <div className="flex flex-row items-center gap-1">
                                        {field.value === null && isPowerEstimated && (
                                            <Popover>
                                                <PopoverTrigger>
                                                    <CircleAlert className="mr-2 h-5 w-5 text-warning" />
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    Die Leistung dieses Gerätes kann noch nicht geschätzt werden. Bitte
                                                    markieren Sie weitere Verbrauchsausschläge, um eine Schätzung zu
                                                    erhalten.
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? undefined}
                                            onChange={(e) => {
                                                field.onChange(Number(e.target.value));
                                            }}
                                            disabled={isPowerEstimated}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <Button className="mt-4" disabled={device !== undefined && !form.formState.isDirty} type="submit">
                    Speichern
                </Button>
            </form>
        </Form>
    );
}
