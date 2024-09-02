import { getDeviceOptionsByPeak, updateDevicesForPeak } from "@/actions/peak";
import { peakSchema } from "@/lib/schema/peak";
import type { DeviceCategory } from "@energyleaf/db/types";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Alert, AlertDescription, AlertTitle } from "@energyleaf/ui/alert";
import {} from "@energyleaf/ui/alert-dialog";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { MultiSelect } from "@energyleaf/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@energyleaf/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BotIcon, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    sensorDataSequenceId: string;
    onInteract: () => void;
}

export interface Device {
    id: string;
    category: DeviceCategory;
    name: string;
    isSuggested: boolean;
    isDraft: boolean;
    deviceId?: number;
}

export function EnergyPeakDeviceAssignmentForm({ sensorDataSequenceId, onInteract }: Props) {
    const queryClient = useQueryClient();
    const [devices, setDevices] = useState<Device[]>([]);
    const [selected, setSelected] = useState<Device[]>([]);
    const [hasSuggestions, setHasSuggestions] = useState<boolean>(false);
    const [draftDevicesSelected, setDraftDevicesSelected] = useState<boolean>(false);

    const {
        data: selectionData,
        isLoading: devicesLoading,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: [`devices${sensorDataSequenceId}`],
        queryFn: () => getDeviceOptionsByPeak(sensorDataSequenceId),
    });

    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            device: [],
        },
    });

    useEffect(() => {
        if (selected) {
            form.setValue("device", selected);
            setDraftDevicesSelected(selected.some((x) => x.isDraft));
        }
    }, [selected, form]);

    useEffect(() => {
        if (selectionData) {
            const { success, payload, message } = selectionData;
            if (!success || !payload) {
                throw new Error("Geräte konnten nicht geladen werden.", { cause: message });
            }

            setHasSuggestions(payload.hasSuggestions);
            setSelected(payload.options.filter((device) => device.isSelected) ?? []);
            setDevices(payload.options);
        }
    }, [selectionData]);

    async function addOrUpdatePeakCallback(data: z.infer<typeof peakSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateDevicesForPeak(data, sensorDataSequenceId);
            await queryClient.invalidateQueries({ queryKey: [`selectedDevices${sensorDataSequenceId}`] });
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof peakSchema>) {
        toast.promise(addOrUpdatePeakCallback(data), {
            loading: "Peak zuweisen...",
            success: "Erfolgreich zugewiesen",
            error: (err: Error) => err.message,
        });

        onInteract();
        refetch();
    }

    function onAbort() {
        onInteract();
    }

    return (
        <>
            {!devicesLoading && !isRefetching && hasSuggestions ? (
                <Alert className="mt-4">
                    <BotIcon />
                    <AlertTitle>Vorschläge</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        Auf Basis des Verbrauchsverlaufs wurden Geräte identifiziert, die zu diesem Verbrauch passen
                        könnten.
                    </AlertDescription>
                </Alert>
            ) : null}
            <Form {...form}>
                <form className="flex flex-col gap-4" onAbortCapture={onAbort} onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="device"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Gerät</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={devices?.map((device) => ({
                                                id: device.id,
                                                name: device.name,
                                                label: device.name,
                                                value: device.id,
                                                icon: device.isSuggested
                                                    ? (props) => <BotIcon {...props} />
                                                    : undefined,
                                            }))}
                                            loading={devicesLoading}
                                            refetching={isRefetching}
                                            initialSelected={selected?.map((device) => ({
                                                ...device,
                                                label: device.name,
                                                value: device.id,
                                                icon: device.isSuggested
                                                    ? (props) => <BotIcon {...props} />
                                                    : undefined,
                                            }))}
                                            onSelectedChange={(e) => {
                                                const selectedDevices = e
                                                    .map((x) => devices.find((d) => d.id === x.value))
                                                    .filter((x) => x !== undefined);
                                                field.onChange(selectedDevices);
                                                setDraftDevicesSelected(selectedDevices.some((x) => x.isDraft));
                                            }}
                                            placeholder="Geräte auswählen..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <div className="flex flex-row-reverse items-center justify-between">
                        <Button type="submit">Speichern</Button>
                        {draftDevicesSelected ? (
                            <Popover>
                                <PopoverContent>
                                    <p>Beim Speichern werden folgende Geräte für Sie hinzugefügt:</p>
                                    {form
                                        .getValues()
                                        .device.filter((device) => device.isDraft)
                                        .map((device) => device.name)
                                        .join(", ")}
                                </PopoverContent>

                                <PopoverTrigger>
                                    <div className="flex flex-row items-center gap-1 text-muted-foreground text-sm">
                                        <InfoIcon className="h-4 w-4" />
                                        Neue Geräte
                                    </div>
                                </PopoverTrigger>
                            </Popover>
                        ) : null}
                    </div>
                </form>
            </Form>
        </>
    );
}
