"use client";

import { useForm } from "@tanstack/react-form";
import { format, isValid, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDaysIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExperimentPhase, type ExperimentPhaseValue } from "@/lib/enums";
import { adminExperimentSchema } from "@/lib/schemas/admin-schema";
import { adminUpdateExperimentAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.input<typeof adminExperimentSchema>;
}

const ExperimentStatusLabels: Record<ExperimentPhaseValue, string> = {
	registered: "Registriert",
	approved: "Genehmigt",
	dismissed: "Abgelehnt",
	exported: "Exportiert",
	first_survey: "Erste Umfrage",
	first_finished: "Erste Phase abgeschlossen",
	installation: "Installation",
	second_survey: "Zweite Umfrage",
	second_finished: "Zweite Phase abgeschlossen",
	third_survey: "Dritte Umfrage",
	third_finished: "Dritte Phase abgeschlossen",
	deinstallation: "Deinstallation",
	inactive: "Inaktiv",
};

function formatDateLabel(date: Date | null): string {
	if (!date) return "Datum wählen";
	return format(date, "PPP", { locale: de });
}

function parseDateValue(value: string | null): Date | null {
	if (!value) return null;
	const parsed = parseISO(value);
	return isValid(parsed) ? parsed : null;
}

function normalizeDateValue(value: string | null): string | null {
	if (!value) return null;
	const parsed = parseISO(value);
	if (!isValid(parsed)) return null;
	return format(parsed, "yyyy-MM-dd");
}

export default function AdminExperimentForm({ userId, initialValues }: Props) {
	const [installationOpen, setInstallationOpen] = useState(false);
	const [deinstallationOpen, setDeinstallationOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			experimentStatus: initialValues.experimentStatus,
			experimentNumber: initialValues.experimentNumber,
			installationDate: normalizeDateValue(initialValues.installationDate),
			deinstallationDate: normalizeDateValue(initialValues.deinstallationDate),
			getsPaid: initialValues.getsPaid,
			usesProlific: initialValues.usesProlific,
		},
		validators: { onSubmit: adminExperimentSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateExperimentAction(userId, value);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
			}
		},
	});

	const pending = form.state.isSubmitting;
	const installationDate = parseDateValue(form.state.values.installationDate);
	const deinstallationDate = parseDateValue(form.state.values.deinstallationDate);

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<form.Field
					name="experimentStatus"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Status</FieldLabel>
								<Select
									onValueChange={(v) =>
										field.handleChange(v === "none" ? null : (v as ExperimentPhaseValue))
									}
									value={field.state.value ?? "none"}
								>
									<SelectTrigger>
										<SelectValue placeholder="Status wählen" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Keine Angabe</SelectItem>
										{(Object.values(ExperimentPhase) as [ExperimentPhaseValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{ExperimentStatusLabels[value]}
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
					name="experimentNumber"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Experiment-Nr.</FieldLabel>
								<Input
									type="number"
									inputMode="numeric"
									value={
										Number.isFinite(field.state.value as number)
											? (field.state.value as number)
											: ""
									}
									onBlur={field.handleBlur}
									onChange={(e) => {
										const next =
											e.target.value === "" ? Number.NaN : Number.parseInt(e.target.value, 10);
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
					name="installationDate"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Installationsdatum</FieldLabel>
								<Popover open={installationOpen} onOpenChange={setInstallationOpen}>
									<PopoverTrigger asChild>
										<Button variant="outline" type="button" className="justify-start">
											<CalendarDaysIcon className="size-4 opacity-50" />
											{formatDateLabel(installationDate)}
										</Button>
									</PopoverTrigger>
									<PopoverContent>
										<Calendar
											locale={de}
											weekStartsOn={1}
											mode="single"
											selected={installationDate ?? undefined}
											onSelect={(date) => {
												const next = date ? format(date, "yyyy-MM-dd") : null;
												field.handleChange(next);
												setInstallationOpen(false);
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="deinstallationDate"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Deinstallationsdatum</FieldLabel>
								<Popover open={deinstallationOpen} onOpenChange={setDeinstallationOpen}>
									<PopoverTrigger asChild>
										<Button variant="outline" type="button" className="justify-start">
											<CalendarDaysIcon className="size-4 opacity-50" />
											{formatDateLabel(deinstallationDate)}
										</Button>
									</PopoverTrigger>
									<PopoverContent>
										<Calendar
											locale={de}
											weekStartsOn={1}
											mode="single"
											selected={deinstallationDate ?? undefined}
											onSelect={(date) => {
												const next = date ? format(date, "yyyy-MM-dd") : null;
												field.handleChange(next);
												setDeinstallationOpen(false);
											}}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="getsPaid"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel htmlFor={field.name}>Vergütung</FieldLabel>
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
							</div>
						</Field>
					)}
				/>
				<form.Field
					name="usesProlific"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel htmlFor={field.name}>Prolific</FieldLabel>
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
