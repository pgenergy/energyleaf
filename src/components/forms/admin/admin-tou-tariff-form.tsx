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
import { Switch } from "@/components/ui/switch";
import { touTariffSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateSimulationTouTariffSettingsAction } from "@/server/actions/admin";

type TouTariffSettingsInput = z.input<typeof touTariffSchema>;
type TariffZone = { start: string; end: string; price: number };

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
	initialValues: z.infer<typeof touTariffSchema>;
}

export default function AdminTouTariffForm({ userId, initialValues }: Props) {
	const defaultValues: TouTariffSettingsInput = {
		basePrice: initialValues.basePrice,
		standardPrice: initialValues.standardPrice,
		zones: initialValues.zones ?? [],
		weekdayZones: initialValues.weekdayZones ?? {},
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: touTariffSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateSimulationTouTariffSettingsAction(
				userId,
				value as z.infer<typeof touTariffSchema>,
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
			{/* Basic Pricing */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Grundpreise</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="basePrice"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Grundpreis (Euro/Monat)</FieldLabel>
									<FieldDescription>Fester monatlicher Grundpreis</FieldDescription>
									<Input
										type="number"
										inputMode="decimal"
										step="0.01"
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
						name="standardPrice"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Standardpreis (ct/kWh)</FieldLabel>
									<FieldDescription>Fallback-Preis wenn keine Preiszone gilt</FieldDescription>
									<Input
										type="number"
										inputMode="decimal"
										step="0.01"
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

			{/* Default Zones */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Standard-Preiszonen</h3>
				<FieldDescription>
					Definieren Sie die Standard-Preiszonen. Für Nachtstrom kann die Endzeit vor der Startzeit liegen
					(z.B. 22:00 - 06:00). Zeiten ohne Zone verwenden den Standardpreis.
				</FieldDescription>
				<form.Field
					name="zones"
					mode="array"
					children={(field) => (
						<div className="flex flex-col gap-3">
							{(field.state.value ?? []).map((_, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: fine here
								<div key={index} className="flex items-center gap-2 flex-wrap">
									<form.Field
										name={`zones[${index}].start`}
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
										name={`zones[${index}].end`}
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
									<span className="text-muted-foreground">zu</span>
									<form.Field
										name={`zones[${index}].price`}
										children={(priceField) => (
											<div className="flex items-center gap-1">
												<Input
													type="number"
													inputMode="decimal"
													step="0.01"
													min="0"
													value={
														Number.isFinite(priceField.state.value as number)
															? (priceField.state.value as number)
															: ""
													}
													onChange={(e) => {
														const next =
															e.target.value === ""
																? Number.NaN
																: parseFloat(e.target.value);
														priceField.handleChange(next);
													}}
													onBlur={priceField.handleBlur}
													className="w-24"
												/>
												<span className="text-muted-foreground">ct/kWh</span>
											</div>
										)}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => field.removeValue(index)}
										className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
									>
										<TrashIcon className="size-4" />
									</Button>
								</div>
							))}
							{(field.state.value ?? []).length === 0 && (
								<div className="text-center text-sm text-muted-foreground py-4 border border-dashed rounded-md">
									Keine Preiszonen definiert. Es gilt der Standardpreis.
								</div>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => field.pushValue({ start: "22:00", end: "06:00", price: 20 })}
								className="w-fit cursor-pointer"
							>
								<PlusIcon className="mr-2 size-4" />
								Preiszone hinzufügen
							</Button>
						</div>
					)}
				/>
			</FieldGroup>

			{/* Weekday Overrides */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Wochentag-Überschreibungen</h3>
				<FieldDescription>
					Optional: Definieren Sie abweichende Preiszonen für einzelne Wochentage (z.B. günstigere
					Wochenendtarife). Wenn nicht aktiviert, werden die Standard-Preiszonen verwendet.
				</FieldDescription>
				<Accordion type="multiple" className="w-full">
					{Weekdays.map((weekday) => (
						<WeekdayZonesField key={weekday} weekday={weekday} form={form} />
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

interface WeekdayZonesFieldProps {
	weekday: Weekday;
	// biome-ignore lint/suspicious/noExplicitAny: Complex generic type from tanstack form
	form: any;
}

function WeekdayZonesField({ weekday, form }: WeekdayZonesFieldProps) {
	return (
		<form.Field
			name={`weekdayZones.${weekday}`}
			// biome-ignore lint/suspicious/noExplicitAny: Complex generic type from tanstack form
			children={(field: any) => {
				const hasCustomZones = field.state.value !== null && field.state.value !== undefined;
				const zones: TariffZone[] = hasCustomZones ? (field.state.value as TariffZone[]) : [];

				const handleToggle = (enabled: boolean) => {
					if (enabled) {
						field.handleChange([{ start: "22:00", end: "06:00", price: 20 }]);
					} else {
						field.handleChange(null);
					}
				};

				const addZone = () => {
					const currentZones = field.state.value as TariffZone[] | null;
					field.handleChange([...(currentZones ?? []), { start: "08:00", end: "20:00", price: 30 }]);
				};

				const removeZone = (index: number) => {
					const currentZones = field.state.value as TariffZone[];
					const newZones = currentZones.filter((_, i) => i !== index);
					field.handleChange(newZones.length > 0 ? newZones : null);
				};

				const updateZone = (index: number, key: keyof TariffZone, value: string | number) => {
					const currentZones = [...(field.state.value as TariffZone[])];
					currentZones[index] = { ...currentZones[index], [key]: value };
					field.handleChange(currentZones);
				};

				return (
					<AccordionItem value={weekday}>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-3">
								<span>{WeekdayDisplay[weekday]}</span>
								<span className="font-normal text-muted-foreground text-sm">
									{hasCustomZones ? "(benutzerdefiniert)" : "(Standard)"}
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="flex flex-col gap-4 pt-2">
								<div className="flex items-center gap-2">
									<Switch
										id={`${weekday}-custom`}
										checked={hasCustomZones}
										onCheckedChange={handleToggle}
									/>
									<Label htmlFor={`${weekday}-custom`}>Benutzerdefinierte Preiszonen</Label>
								</div>

								{hasCustomZones && (
									<div className="flex flex-col gap-3 pl-4">
										{zones.map((zone, index) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: fine here
											<div key={index} className="flex items-center gap-2 flex-wrap">
												<Input
													type="time"
													value={zone.start}
													onChange={(e) => updateZone(index, "start", e.target.value)}
													className="w-28"
												/>
												<span className="text-muted-foreground">bis</span>
												<Input
													type="time"
													value={zone.end}
													onChange={(e) => updateZone(index, "end", e.target.value)}
													className="w-28"
												/>
												<span className="text-muted-foreground">zu</span>
												<div className="flex items-center gap-1">
													<Input
														type="number"
														inputMode="decimal"
														step="0.01"
														min="0"
														value={Number.isFinite(zone.price) ? zone.price : ""}
														onChange={(e) => {
															const next =
																e.target.value === ""
																	? Number.NaN
																	: parseFloat(e.target.value);
															updateZone(index, "price", next);
														}}
														className="w-24"
													/>
													<span className="text-muted-foreground">ct/kWh</span>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeZone(index)}
													className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
												>
													<TrashIcon className="size-4" />
												</Button>
											</div>
										))}
										{zones.length === 0 && (
											<div className="text-center text-sm text-muted-foreground py-4 border border-dashed rounded-md">
												Keine Preiszonen definiert. Es gilt der Standardpreis.
											</div>
										)}
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addZone}
											className="w-fit cursor-pointer"
										>
											<PlusIcon className="mr-2 size-4" />
											Preiszone hinzufügen
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
