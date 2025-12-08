"use client";

import { useForm } from "@tanstack/react-form";
import { format, setDay } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { reportConfigSchema } from "@/lib/schemas/profile-schema";
import { updateReportConfigAction } from "@/server/actions/reports";

interface Props {
	initialValues: z.infer<typeof reportConfigSchema>;
}

type ReportConfigValues = z.input<typeof reportConfigSchema>;

export default function ReportConfigForm(props: Props) {
	const defaultValues: ReportConfigValues = {
		active: props.initialValues.active,
		days: props.initialValues.days,
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: reportConfigSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateReportConfigAction(value as z.infer<typeof reportConfigSchema>);
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
					name="active"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<div className="flex flex-row items-center justify-between gap-4">
									<div className="flex flex-col gap-2">
										<FieldLabel>Aktiv</FieldLabel>
										<FieldDescription>Sollen Berichte erstellt werden?</FieldDescription>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</div>
									<Switch
										checked={field.state.value === true}
										onCheckedChange={(c) => field.handleChange(c === true)}
									/>
								</div>
							</Field>
						);
					}}
				/>

				<form.Field
					name="days"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						const stringDays = (field.state.value ?? []).map((d) => d.toString());
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Tage</FieldLabel>
								<FieldDescription>Welche Tage sollen Berichte erstellt werden?</FieldDescription>
								<ToggleGroup
									type="multiple"
									className="flex flex-row flex-wrap justify-start"
									value={stringDays}
									onValueChange={(days) => field.handleChange(days.map((d) => Number(d)))}
								>
									{([1, 2, 3, 4, 5, 6, 0] as number[]).map((day) => (
										<ToggleGroupItem
											key={day}
											value={day.toString()}
											variant="outline"
											className="data-[state=on]:bg-primary data-[state=on]:text-foreground cursor-pointer"
										>
											{format(setDay(new Date(), day), "EEEE", { locale: de })}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
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
