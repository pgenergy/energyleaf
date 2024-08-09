import { getDevicesByPeak, getDevicesByUser, updateDevicesForPeak } from "@/actions/peak";
import { peakSchema } from "@/lib/schema/peak";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { MultiSelect } from "@energyleaf/ui/multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    userId: string;
    sensorDataSequenceId: string;
    detectedDevices: { name: string; confidence: number }[];
    onInteract: () => void;
}

export function EnergyPeakDeviceAssignmentForm({ userId, sensorDataSequenceId, detectedDevices, onInteract }: Props) {
    const queryClient = useQueryClient();
    const {
        data: selectedDevices,
        isLoading: selectedDevicesLoading,
        isRefetching: selectedDevicesRefetching,
        refetch: refetchSelectedDevices,
    } = useQuery({
        queryKey: [`selectedDevices${sensorDataSequenceId}`],
        queryFn: () => getDevicesByPeak(sensorDataSequenceId),
    });
    const { data: devices, isLoading: devicesLoading } = useQuery({
        queryKey: ["devices"],
        queryFn: () => getDevicesByUser(userId),
    });

    const form = useForm<z.infer<typeof peakSchema>>({
        resolver: zodResolver(peakSchema),
        defaultValues: {
            device: [],
        },
    });

    useEffect(() => {
        if (selectedDevices) {
            form.setValue("device", selectedDevices);
        } else {
            const filteredDetectedDevices = detectedDevices
                .filter(device => device.confidence >= 0.9)
                .map((device, index) => ({
                    id: index,
                    name: device.name
                }));

            form.setValue("device", filteredDetectedDevices);
        }
    }, [selectedDevices, detectedDevices, form]);

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
        refetchSelectedDevices();
    }

    function onAbort() {
        onInteract();
    }

    return (
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
                                            value: device.id.toString(),
                                        }))}
                                        loading={devicesLoading || selectedDevicesLoading}
                                        refetching={selectedDevicesRefetching}
                                        initialSelected={selectedDevices?.map((device) => ({
                                            ...device,
                                            label: device.name,
                                            value: device.id.toString(),
                                        }))}
                                        onSelectedChange={field.onChange}
                                        placeholder="Geräte auswählen..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <div className="flex flex-row justify-end">
                    <Button type="submit">Speichern</Button>
                </div>
            </form>
        </Form>
    );
}
