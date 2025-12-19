"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HouseType, HouseTypeDisplay, type HouseTypeValue } from "@/lib/enums";
import { householdSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateHouseholdAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.infer<typeof householdSchema>;
}

type HouseholdValues = z.input<typeof householdSchema>;

export default function AdminHouseholdForm({ userId, initialValues }: Props) {
	const defaultValues: HouseholdValues = {
		houseType: initialValues.houseType,
		livingSpace: initialValues.livingSpace,
		people: initialValues.people,
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: householdSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateHouseholdAction(userId, value as z.infer<typeof householdSchema>);
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
					name="houseType"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Gebäudetyp</FieldLabel>
								<Select
									onValueChange={(v) => field.handleChange(v as HouseTypeValue)}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie den Gebäudetyp" />
									</SelectTrigger>
									<SelectContent>
										{(Object.values(HouseType) as [HouseTypeValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{HouseTypeDisplay[value]}
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
					name="livingSpace"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Gebäudegröße in qm</FieldLabel>
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
					name="people"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Personen im Haushalt</FieldLabel>
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
