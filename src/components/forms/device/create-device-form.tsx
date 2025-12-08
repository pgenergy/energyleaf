"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeviceCategory, DeviceCategoryDisplay, type DeviceCategoryValue } from "@/lib/enums";
import { deviceSchema } from "@/lib/schemas/device-schema";
import { createDeviceAction, updateDeviceAction } from "@/server/actions/device";

interface Props {
	initialValues?: z.infer<typeof deviceSchema>;
	deviceId?: string;
}

export default function DeviceCreationForm(props: Props) {
	const router = useRouter();

	const defaultValues: z.input<typeof deviceSchema> = {
		name: props.initialValues?.name ?? "",
		category: props.initialValues?.category ?? DeviceCategory.Others,
		power: props.initialValues?.power,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: deviceSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Gerät wird gespeichert...", {
				duration: Infinity,
			});
			let res: {
				success: boolean;
				message: string;
			};
			if (props.initialValues && props.deviceId) {
				res = await updateDeviceAction(props.deviceId, value as z.infer<typeof deviceSchema>);
			} else {
				res = await createDeviceAction(value as z.infer<typeof deviceSchema>);
			}

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
				router.push("/devices");
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
				name="name"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Gerätename</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<form.Field
				name="category"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel>Tariftyp</FieldLabel>
							<Select
								onValueChange={(v) => field.handleChange(v as DeviceCategory)}
								value={field.state.value}
							>
								<SelectTrigger>
									<SelectValue placeholder="Wählen Sie eine Kategorie aus." />
								</SelectTrigger>
								<SelectContent>
									{(Object.values(DeviceCategory) as [DeviceCategoryValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{DeviceCategoryDisplay[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<form.Field
				name="power"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Geschätze Leistung</FieldLabel>
							<FieldDescription>
								Geben Sie hier die geschätzte Leistung Ihres Gerätes an. Wenn Sie diese nicht kennen,
								lassen Sie das Feld leer.
							</FieldDescription>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								value={
									field.state.value !== undefined && field.state.value !== null
										? String(field.state.value)
										: ""
								}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(e.target.value === "" ? undefined : Number(e.target.value))
								}
								aria-invalid={isInvalid}
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
						{props.initialValues && props.deviceId ? "Speichern" : "Gerät erstellen"}
					</Button>
				</div>
			</div>
		</form>
	);
}
