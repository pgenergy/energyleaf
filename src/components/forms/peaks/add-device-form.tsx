"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { DeviceCategoryToIcon } from "@/components/icons/device-icon";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import type { DeviceCategory } from "@/lib/enums";
import { addDeviceToPeakSchema } from "@/lib/schemas/peak-schema";
import { updateDevicesToPeakAction } from "@/server/actions/peaks";
import type { Device } from "@/server/db/tables/device";

interface Props {
	devices: Device[];
	peakId: string;
	initalDevices?: {
		id: string;
		name: string;
		category: DeviceCategory;
	}[];
}

export default function AddDeviceToPeakForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const form = useForm<z.infer<typeof addDeviceToPeakSchema>>({
		resolver: zodResolver(addDeviceToPeakSchema),
		defaultValues: {
			devices: props.initalDevices ?? [],
		},
	});

	function handleSubmit(data: z.infer<typeof addDeviceToPeakSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Weise Geräte zu...", {
				duration: Infinity,
			});
			const res = await updateDevicesToPeakAction(data, props.peakId);

			if (!res) {
				toast.success("Ein unerwarteter Fehler ist aufgetreten.", {
					id: toastId,
					duration: 4000,
				});
				return;
			}

			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				router.push("/peaks");
			}
		});
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<FormField
					control={form.control}
					name="devices"
					render={({ field }) => {
						return (
							<FormItem>
								<FormLabel>Geräte</FormLabel>
								<FormControl>
									<MultiSelect
										options={props.devices?.map((device) => ({
											id: device.id,
											name: device.name,
											label: device.name,
											value: device.id,
											icon: DeviceCategoryToIcon(device.category),
										}))}
										initialSelected={props.initalDevices?.map((device) => ({
											...device,
											label: device.name,
											value: device.id,
											icon: DeviceCategoryToIcon(device.category),
										}))}
										onSelectedChange={(e) => {
											const selectedDevices = e
												.map((x) => props.devices.find((d) => d.id === x.value))
												.filter((x) => x !== undefined);
											field.onChange(selectedDevices);
										}}
										placeholder="Geräte auswählen..."
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<div className="flex flex-row items-center justify-end">
					<div>
						<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
							{pending ? <Loader2Icon className="size-4" /> : null}
							Speichern
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
