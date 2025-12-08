"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeviceCategoryToIcon } from "@/components/icons/device-icon";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			devices: props.initalDevices ?? [],
		},
		validators: {
			onSubmit: addDeviceToPeakSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Weise Geräte zu...", {
				duration: Infinity,
			});
			const res = await updateDevicesToPeakAction(value, props.peakId);

			if (!res) {
				toast.error("Ein unerwarteter Fehler ist aufgetreten.", {
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
		},
	});

	const pending = form.state.isSubmitting;

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field
				name="devices"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel>Geräte</FieldLabel>
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
									field.handleChange(selectedDevices);
								}}
								placeholder="Geräte auswählen..."
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
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
	);
}
