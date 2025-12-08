"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { anomalySchema } from "@/lib/schemas/profile-schema";
import { updateAnomalyAction } from "@/server/actions/reports";

interface Props {
	initialValues: z.infer<typeof anomalySchema>;
}

const submitSchema = z.object({ active: z.boolean() });

export default function AnomalyForm(props: Props) {
	const defaultValues: z.infer<typeof anomalySchema> = {
		active: props.initialValues.active,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: submitSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateAnomalyAction(value);
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
			method="POST"
			className="grid grid-cols-1 gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field
					name="active"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<div className="flex flex-row items-center justify-between gap-4">
									<div className="flex flex-col gap-2">
										<FieldLabel>Aktiv</FieldLabel>
										<FieldDescription>
											Sollen E-Mails zur Anomalieerkennung versendet werden?
										</FieldDescription>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</div>
									<Switch
										checked={Boolean(field.state.value)}
										onCheckedChange={(c) => field.handleChange(c === true)}
									/>
								</div>
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
