"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChargingSpeed, ChargingSpeedDisplay, type ChargingSpeedValue } from "@/lib/enums";
import { evSettingsSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateSimulationEvSettingsAction } from "@/server/actions/admin";

type EvSettingsInput = z.input<typeof evSettingsSchema>;
type ChargingTimeSlot = { start: string; end: string };

const Weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type Weekday = (typeof Weekdays)[number];

const WeekdayDisplay: Record<Weekday, string> = {
	monday: "Montag",
	tuesday: "Dienstag",
	wednesday: "Mittwoch",
	thursday: "Donnerstag",
	friday: "Freitag",
	saturday: "Samstag",
	sunday: "Sonntag",
};

interface Props {
	userId: string;
	initialValues: z.infer<typeof evSettingsSchema>;
}

export default function AdminEvForm({ userId, initialValues }: Props) {
	const defaultValues: EvSettingsInput = {
		chargingSpeed: initialValues.chargingSpeed,
		evCapacityKwh: initialValues.evCapacityKwh,
		dailyDrivingDistanceKm: initialValues.dailyDrivingDistanceKm,
		avgConsumptionPer100Km: initialValues.avgConsumptionPer100Km,
		defaultSchedule:
			initialValues.defaultSchedule.length > 0
				? initialValues.defaultSchedule
				: [{ start: "22:00", end: "06:00" }],
		weekdaySchedules: initialValues.weekdaySchedules,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: evSettingsSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateSimulationEvSettingsAction(userId, value as z.infer<typeof evSettingsSchema>);
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
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{/* Basic Settings */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Grundeinstellungen</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="chargingSpeed"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Ladegeschwindigkeit (Wallbox)</FieldLabel>
									<Select
										onValueChange={(v) => field.handleChange(v as ChargingSpeedValue)}
										value={field.state.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Wählen Sie die Ladegeschwindigkeit" />
										</SelectTrigger>
										<SelectContent>
											{(Object.values(ChargingSpeed) as [ChargingSpeedValue]).map((value) => (
												<SelectItem value={value} key={value}>
													{ChargingSpeedDisplay[value]}
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
						name="evCapacityKwh"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Batteriekapazität (kWh)</FieldLabel>
									<FieldDescription>z.B. 44 kWh</FieldDescription>
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
											const next =
												e.target.value === "" ? Number.NaN : parseFloat(e.target.value);
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
						name="dailyDrivingDistanceKm"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Tägliche Fahrstrecke (km, optional)</FieldLabel>
									<FieldDescription>Durchschnittliche tägliche Fahrleistung</FieldDescription>
									<Input
										type="number"
										inputMode="decimal"
										step="1"
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
					<form.Field
						name="avgConsumptionPer100Km"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Verbrauch auf 100 km (kWh, optional)</FieldLabel>
									<FieldDescription>Durchschnittlicher Energieverbrauch pro 100 km</FieldDescription>
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
				</div>
			</FieldGroup>

			{/* Default Schedule */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Standard-Ladezeiten</h3>
				<FieldDescription>
					Definieren Sie die Standard-Ladezeiten. Für Nachtladung kann die Endzeit vor der Startzeit liegen
					(z.B. 22:00 - 06:00).
				</FieldDescription>
				<form.Field
					name="defaultSchedule"
					mode="array"
					children={(field) => (
						<div className="flex flex-col gap-3">
							{(field.state.value ?? []).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
								<div key={index} className="flex items-center gap-2">
									<form.Field
										name={`defaultSchedule[${index}].start`}
										children={(startField) => (
											<Input
												type="time"
												value={startField.state.value}
												onChange={(e) => startField.handleChange(e.target.value)}
												onBlur={startField.handleBlur}
												className="w-32"
											/>
										)}
									/>
									<span className="text-muted-foreground">bis</span>
									<form.Field
										name={`defaultSchedule[${index}].end`}
										children={(endField) => (
											<Input
												type="time"
												value={endField.state.value}
												onChange={(e) => endField.handleChange(e.target.value)}
												onBlur={endField.handleBlur}
												className="w-32"
											/>
										)}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => field.removeValue(index)}
										disabled={(field.state.value ?? []).length <= 1}
										className="cursor-pointer"
									>
										<TrashIcon className="size-4" />
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => field.pushValue({ start: "08:00", end: "10:00" })}
								className="w-fit cursor-pointer"
							>
								<PlusIcon className="mr-2 size-4" />
								Zeitslot hinzufügen
							</Button>
						</div>
					)}
				/>
			</FieldGroup>

			{/* Weekday Overrides */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Wochentag-Überschreibungen</h3>
				<FieldDescription>
					Optional: Definieren Sie abweichende Ladezeiten für einzelne Wochentage. Wenn nicht aktiviert, wird
					der Standard verwendet.
				</FieldDescription>
				<Accordion type="multiple" className="w-full">
					{Weekdays.map((weekday) => (
						<WeekdayScheduleField key={weekday} weekday={weekday} form={form} />
					))}
				</Accordion>
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

interface WeekdayScheduleFieldProps {
	weekday: Weekday;
	// biome-ignore lint/suspicious/noExplicitAny: Complex generic type from tanstack form
	form: any;
}

function WeekdayScheduleField({ weekday, form }: WeekdayScheduleFieldProps) {
	return (
		<form.Field
			name={`weekdaySchedules.${weekday}`}
			// biome-ignore lint/suspicious/noExplicitAny: Complex generic type from tanstack form
			children={(field: any) => {
				const hasCustomSchedule = field.state.value !== null && field.state.value !== undefined;
				const slots: ChargingTimeSlot[] = hasCustomSchedule ? (field.state.value as ChargingTimeSlot[]) : [];

				const handleToggle = (enabled: boolean) => {
					if (enabled) {
						field.handleChange([{ start: "22:00", end: "06:00" }]);
					} else {
						field.handleChange(null);
					}
				};

				const addSlot = () => {
					const currentSlots = field.state.value as ChargingTimeSlot[] | null;
					field.handleChange([...(currentSlots ?? []), { start: "08:00", end: "10:00" }]);
				};

				const removeSlot = (index: number) => {
					const currentSlots = field.state.value as ChargingTimeSlot[];
					const newSlots = currentSlots.filter((_, i) => i !== index);
					field.handleChange(newSlots.length > 0 ? newSlots : null);
				};

				const updateSlot = (index: number, key: "start" | "end", value: string) => {
					const currentSlots = [...(field.state.value as ChargingTimeSlot[])];
					currentSlots[index] = { ...currentSlots[index], [key]: value };
					field.handleChange(currentSlots);
				};

				return (
					<AccordionItem value={weekday}>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-3">
								<span>{WeekdayDisplay[weekday]}</span>
								<span className="font-normal text-muted-foreground text-sm">
									{hasCustomSchedule ? "(benutzerdefiniert)" : "(Standard)"}
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="flex flex-col gap-4 pt-2">
								<div className="flex items-center gap-2">
									<Switch
										id={`${weekday}-custom`}
										checked={hasCustomSchedule}
										onCheckedChange={handleToggle}
									/>
									<Label htmlFor={`${weekday}-custom`}>Benutzerdefinierte Zeiten</Label>
								</div>

								{hasCustomSchedule && (
									<div className="flex flex-col gap-3 pl-4">
										{slots.map((slot, index) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: index is fine here
											<div key={index} className="flex items-center gap-2">
												<Input
													type="time"
													value={slot.start}
													onChange={(e) => updateSlot(index, "start", e.target.value)}
													className="w-32"
												/>
												<span className="text-muted-foreground">bis</span>
												<Input
													type="time"
													value={slot.end}
													onChange={(e) => updateSlot(index, "end", e.target.value)}
													className="w-32"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeSlot(index)}
													className="cursor-pointer"
												>
													<TrashIcon className="size-4" />
												</Button>
											</div>
										))}
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addSlot}
											className="w-fit cursor-pointer"
										>
											<PlusIcon className="mr-2 size-4" />
											Zeitslot hinzufügen
										</Button>
									</div>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				);
			}}
		/>
	);
}
