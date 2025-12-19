"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TariffType, TariffTypeDisplay, type TariffTypeValue } from "@/lib/enums";
import { energyTarfiffSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateEnergyTariffAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.infer<typeof energyTarfiffSchema>;
}

type TariffFormValues = z.input<typeof energyTarfiffSchema>;
type TariffOutputValues = z.infer<typeof energyTarfiffSchema>;

export default function AdminEnergyTariffForm({ userId, initialValues }: Props) {
	const defaultValues: TariffFormValues = {
		tariffType: initialValues.tariffType,
		basePrice: initialValues.basePrice,
		workingPrice: initialValues.workingPrice,
		monthlyPayment: initialValues.monthlyPayment,
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: energyTarfiffSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateEnergyTariffAction(userId, value as TariffOutputValues);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
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
					name="tariffType"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Tariftyp</FieldLabel>
								<Select
									onValueChange={(v) => field.handleChange(v as TariffTypeValue)}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie den Tarif" />
									</SelectTrigger>
									<SelectContent>
										{(Object.values(TariffType) as [TariffTypeValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{TariffTypeDisplay[value]}
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
					name="basePrice"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Monatlicher Basispreis (€)</FieldLabel>
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
					name="workingPrice"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Arbeitspreis (ct/kWh)</FieldLabel>
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
					name="monthlyPayment"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Monatlicher Abschlag (€)</FieldLabel>
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
