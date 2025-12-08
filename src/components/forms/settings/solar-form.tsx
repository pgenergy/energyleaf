"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolarOrientation, SolarOrientationDisplay, type SolarOrientationValue } from "@/lib/enums";
import { solarSettingsSchema } from "@/lib/schemas/profile-schema";
import { updateSimulationSolarSettingsAction } from "@/server/actions/simulations";

interface Props {
	initialValues: z.infer<typeof solarSettingsSchema>;
}

export default function SolarForm(props: Props) {
	const defaultValues: z.input<typeof solarSettingsSchema> = {
		peakPower: props.initialValues.peakPower,
		orientation: props.initialValues.orientation,
		inverterPower: props.initialValues.inverterPower,
		sunHoursPerDay: props.initialValues.sunHoursPerDay,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: solarSettingsSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateSimulationSolarSettingsAction(value as z.infer<typeof solarSettingsSchema>);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
				return;
			}
			toast.success(res.message, { id: toastId, duration: 4000 });
		},
	});

	const pending = form.state.isSubmitting;

	return (
		<form
			className="grid grid-cols-1 gap-4 md:grid-cols-2"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field
					name="peakPower"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Peak-Leistung (kWp)</FieldLabel>
								<FieldDescription>Maximale Leistung der Anlage</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									step="0.1"
									value={
										Number.isFinite(field.state.value as number)
											? (field.state.value as number)
											: ""
									}
									onBlur={field.handleBlur}
									onChange={(e) => {
										const next = e.target.value === "" ? Number.NaN : parseFloat(e.target.value);
										field.handleChange(next);
									}}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="orientation"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Ausrichtung</FieldLabel>
								<Select
									onValueChange={(v) => field.handleChange(v as SolarOrientationValue)}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie die Ausrichtung" />
									</SelectTrigger>
									<SelectContent>
										{(Object.values(SolarOrientation) as [SolarOrientationValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{SolarOrientationDisplay[value]}
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
					name="inverterPower"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Wechselrichter (kW)</FieldLabel>
								<FieldDescription>Optional: Max. Leistung des Wechselrichters</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									step="0.1"
									value={
										Number.isFinite(field.state.value as number)
											? (field.state.value as number)
											: ""
									}
									onBlur={field.handleBlur}
									onChange={(e) => {
										const next = e.target.value === "" ? Number.NaN : parseFloat(e.target.value);
										field.handleChange(next);
									}}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="sunHoursPerDay"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Sonnenstunden pro Tag (h)</FieldLabel>
								<FieldDescription>
									Durchschnittliche Sonnenstunden pro Tag (z.B. 4-5 h in Deutschland)
								</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									step="0.5"
									value={
										Number.isFinite(field.state.value as number)
											? (field.state.value as number)
											: ""
									}
									onBlur={field.handleBlur}
									onChange={(e) => {
										const next = e.target.value === "" ? undefined : parseFloat(e.target.value);
										field.handleChange(next);
									}}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>
			<div className="col-span-1 flex flex-row items-center justify-end md:col-span-2">
				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? <Loader2Icon className="size-4" /> : null}
					Speichern
				</Button>
			</div>
		</form>
	);
}
