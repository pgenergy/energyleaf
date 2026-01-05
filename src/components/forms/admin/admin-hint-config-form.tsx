"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HintStageType, HintStageTypeDisplay, type HintStageTypeValue } from "@/lib/enums";
import { adminHintConfigSchema } from "@/lib/schemas/admin-schema";
import { adminUpdateHintConfigAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.infer<typeof adminHintConfigSchema>;
}

export default function AdminHintConfigForm({ userId, initialValues }: Props) {
	const form = useForm({
		defaultValues: { ...initialValues },
		validators: { onSubmit: adminHintConfigSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateHintConfigAction(userId, value);
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
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field
					name="stage"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Hinweis-Stufe</FieldLabel>
								<Select
									onValueChange={(v) => field.handleChange(v as HintStageTypeValue)}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie die Stufe" />
									</SelectTrigger>
									<SelectContent>
										{(Object.values(HintStageType) as [HintStageTypeValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{HintStageTypeDisplay[value]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FieldDescription>
									Bei Änderung der Stufe wird der Fortschritt zurückgesetzt.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="hintsEnabled"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<FieldLabel htmlFor={field.name}>Hinweise aktiviert</FieldLabel>
									<FieldDescription>
										Wenn deaktiviert, erhält der Benutzer keine täglichen Hinweise.
									</FieldDescription>
								</div>
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
							</div>
						</Field>
					)}
				/>
			</FieldGroup>
			<div className="flex flex-row items-center justify-end">
				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? <Loader2Icon className="size-4" /> : null}
					Speichern
				</Button>
			</div>
		</form>
	);
}
