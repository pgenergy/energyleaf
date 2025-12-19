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
import { HeatPumpSource, HeatPumpSourceDisplay, type HeatPumpSourceValue } from "@/lib/enums";
import { heatPumpSettingsSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateSimulationHeatPumpSettingsAction } from "@/server/actions/admin";

type HeatPumpSettingsInput = z.input<typeof heatPumpSettingsSchema>;
type HeatingTimeSlot = { start: string; end: string; targetTemperature: number };

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
	initialValues: z.infer<typeof heatPumpSettingsSchema>;
}

export default function AdminHeatPumpForm({ userId, initialValues }: Props) {
	const defaultValues: HeatPumpSettingsInput = {
		source: initialValues.source,
		powerKw: initialValues.powerKw,
		bufferLiter: initialValues.bufferLiter,
		defaultSchedule:
			initialValues.defaultSchedule.length > 0
				? initialValues.defaultSchedule
				: [{ start: "06:00", end: "22:00", targetTemperature: 21 }],
		weekdaySchedules: initialValues.weekdaySchedules,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: heatPumpSettingsSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateSimulationHeatPumpSettingsAction(
				userId,
				value as z.infer<typeof heatPumpSettingsSchema>,
			);
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
						name="source"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Wärmequelle</FieldLabel>
									<Select
										onValueChange={(v) => field.handleChange(v as HeatPumpSourceValue)}
										value={field.state.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Wählen Sie die Wärmequelle" />
										</SelectTrigger>
										<SelectContent>
											{(Object.values(HeatPumpSource) as [HeatPumpSourceValue]).map((value) => (
												<SelectItem value={value} key={value}>
													{HeatPumpSourceDisplay[value]}
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
						name="powerKw"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Heizleistung (kW)</FieldLabel>
									<FieldDescription>Nennwärmeleistung der Anlage</FieldDescription>
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
						name="bufferLiter"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Pufferspeicher (Liter)</FieldLabel>
									<FieldDescription>Optional: Größe des Warmwasserspeichers</FieldDescription>
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
				</div>
			</FieldGroup>

			{/* Default Schedule */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Standard-Heizzeiten</h3>
				<FieldDescription>
					Definieren Sie die Standard-Heizzeiten mit Zieltemperatur. Für Nachtabsenkung können Sie mehrere
					Zeitslots definieren (z.B. 06:00-22:00 mit 21°C, 22:00-06:00 mit 18°C).
				</FieldDescription>
				<form.Field
					name="defaultSchedule"
					mode="array"
					children={(field) => (
						<div className="flex flex-col gap-3">
							{(field.state.value ?? []).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: fine here
								<div key={index} className="flex items-center gap-2 flex-wrap">
									<form.Field
										name={`defaultSchedule[${index}].start`}
										children={(startField) => (
											<Input
												type="time"
												value={startField.state.value}
												onChange={(e) => startField.handleChange(e.target.value)}
												onBlur={startField.handleBlur}
												className="w-28"
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
												className="w-28"
											/>
										)}
									/>
									<span className="text-muted-foreground">bei</span>
									<form.Field
										name={`defaultSchedule[${index}].targetTemperature`}
										children={(tempField) => (
											<div className="flex items-center gap-1">
												<Input
													type="number"
													inputMode="decimal"
													step="0.5"
													min="10"
													max="30"
													value={
														Number.isFinite(tempField.state.value as number)
															? (tempField.state.value as number)
															: ""
													}
													onChange={(e) => {
														const next =
															e.target.value === ""
																? Number.NaN
																: parseFloat(e.target.value);
														tempField.handleChange(next);
													}}
													onBlur={tempField.handleBlur}
													className="w-20"
												/>
												<span className="text-muted-foreground">°C</span>
											</div>
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
								onClick={() => field.pushValue({ start: "22:00", end: "06:00", targetTemperature: 18 })}
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
					Optional: Definieren Sie abweichende Heizzeiten für einzelne Wochentage. Wenn nicht aktiviert, wird
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
				const slots: HeatingTimeSlot[] = hasCustomSchedule ? (field.state.value as HeatingTimeSlot[]) : [];

				const handleToggle = (enabled: boolean) => {
					if (enabled) {
						field.handleChange([{ start: "06:00", end: "22:00", targetTemperature: 21 }]);
					} else {
						field.handleChange(null);
					}
				};

				const addSlot = () => {
					const currentSlots = field.state.value as HeatingTimeSlot[] | null;
					field.handleChange([
						...(currentSlots ?? []),
						{ start: "22:00", end: "06:00", targetTemperature: 18 },
					]);
				};

				const removeSlot = (index: number) => {
					const currentSlots = field.state.value as HeatingTimeSlot[];
					const newSlots = currentSlots.filter((_, i) => i !== index);
					field.handleChange(newSlots.length > 0 ? newSlots : null);
				};

				const updateSlot = (index: number, key: keyof HeatingTimeSlot, value: string | number) => {
					const currentSlots = [...(field.state.value as HeatingTimeSlot[])];
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
											// biome-ignore lint/suspicious/noArrayIndexKey: fine here
											<div key={index} className="flex items-center gap-2 flex-wrap">
												<Input
													type="time"
													value={slot.start}
													onChange={(e) => updateSlot(index, "start", e.target.value)}
													className="w-28"
												/>
												<span className="text-muted-foreground">bis</span>
												<Input
													type="time"
													value={slot.end}
													onChange={(e) => updateSlot(index, "end", e.target.value)}
													className="w-28"
												/>
												<span className="text-muted-foreground">bei</span>
												<div className="flex items-center gap-1">
													<Input
														type="number"
														inputMode="decimal"
														step="0.5"
														min="10"
														max="30"
														value={
															Number.isFinite(slot.targetTemperature)
																? slot.targetTemperature
																: ""
														}
														onChange={(e) => {
															const next =
																e.target.value === ""
																	? Number.NaN
																	: parseFloat(e.target.value);
															updateSlot(index, "targetTemperature", next);
														}}
														className="w-20"
													/>
													<span className="text-muted-foreground">°C</span>
												</div>
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
