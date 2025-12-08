"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { energyGoalSchema } from "@/lib/schemas/profile-schema";
import { updateEnergyGoalAction } from "@/server/actions/goals";

interface Props {
	initialValues: z.infer<typeof energyGoalSchema>;
}

export default function EnergyGoalForm(props: Props) {
	const defaultValues: z.input<typeof energyGoalSchema> = {
		cost: props.initialValues.cost,
		energy: props.initialValues.energy,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: energyGoalSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateEnergyGoalAction(value as z.infer<typeof energyGoalSchema>);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else if (res.payload !== undefined) {
				toast.success(res.message, { id: toastId, duration: 4000 });
				form.setFieldValue("energy", res.payload as number);
			}
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
					name="cost"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Zielkosten</FieldLabel>
								<FieldDescription>
									Betrag in Euro, den Sie maximal pro Monat für die Energie-Kosten ausgeben möchten.
								</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
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
					name="energy"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Zielverbrauch</FieldLabel>
								<FieldDescription>
									Dieser Wert errechnet sich nach dem Sie ihre gewünschte Energie-Kosten-Zielwert
									eingegeben haben.
								</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									disabled
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
