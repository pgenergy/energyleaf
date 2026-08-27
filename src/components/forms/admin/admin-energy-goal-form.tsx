"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { energyGoalSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateEnergyGoalAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.infer<typeof energyGoalSchema>;
	basePrice: number;
	workingPrice: number;
}

export default function AdminEnergyGoalForm({ userId, initialValues, basePrice, workingPrice }: Props) {
	const defaultValues: z.input<typeof energyGoalSchema> = {
		cost: initialValues.cost,
		energy: initialValues.energy,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: energyGoalSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateEnergyGoalAction(userId, value as z.infer<typeof energyGoalSchema>);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else if (res.payload !== undefined) {
				toast.success(res.message, { id: toastId, duration: 4000 });
				form.setFieldValue("energy", res.payload as number);
			}
		},
	});

	const pending = form.state.isSubmitting;

	const cost = Number(form.state.values.cost ?? 0);
	const computedEnergy = workingPrice > 0 ? Math.max(0, (cost - basePrice) / workingPrice) : 0;

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
								<FieldLabel>Monatliches Energiekosten-Limit</FieldLabel>
								<FieldDescription>
									Das monatliche Limit für alle Energiekosten des Benutzers (inkl. Grundpreis).<br/>Beim Grundpreis beträgt der erlaubte Verbrauch 0 kWh.
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
								<FieldLabel>Verbrauchslimit (kWh)</FieldLabel>
								<FieldDescription>
									Dieser Wert wird automatisch aus dem Kosten-Limit berechnet.
								</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									disabled
									value={
										Number.isFinite(computedEnergy)
											? Math.round(computedEnergy * 100) / 100
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
