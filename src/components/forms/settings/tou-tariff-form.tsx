"use client";

import { useForm } from "@tanstack/react-form";
import { InfoIcon, Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { touTariffSchema } from "@/lib/schemas/profile-schema";
import { updateSimulationTouTariffSettingsAction } from "@/server/actions/simulations";
import type { TouTariffTemplate } from "@/server/db/tables/templates";

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
	initialValues: z.infer<typeof touTariffSchema>;
	templates?: TouTariffTemplate[];
}

export default function TouTariffForm(props: Props) {
	const { templates = [] } = props;
	const defaultValues: TouTariffSettingsInput = {
		pricingMode: props.initialValues.pricingMode ?? "tou",
		basePrice: props.initialValues.basePrice,
		standardPrice: props.initialValues.standardPrice,
		zones: props.initialValues.zones ?? [],
		weekdayZones: props.initialValues.weekdayZones ?? {},
		spotMarkup: props.initialValues.spotMarkup ?? 3,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: touTariffSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateSimulationTouTariffSettingsAction(value as z.infer<typeof touTariffSchema>);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
				return;
			}
			toast.success(res.message, { id: toastId, duration: 4000 });
		},
	});

	const pending = form.state.isSubmitting;

	const handleTemplateSelect = (templateId: string) => {
		const template = templates.find((t) => t.id === templateId);
		if (!template) return;

		form.setFieldValue("basePrice", template.basePrice);
		form.setFieldValue("standardPrice", template.standardPrice);
		form.setFieldValue("zones", template.zones ?? []);
		form.setFieldValue("weekdayZones", template.weekdayZones ?? {});
	};

	return (
		<form
			className="flex flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{/* Pricing Mode Selector */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Tarifmodell</h3>
				<FieldDescription>
					Wählen Sie zwischen einem Zeittarif (TOU) mit festen Preiszonen oder dynamischen Spotpreisen von der
					Strombörse.
				</FieldDescription>
				<form.Field
					name="pricingMode"
					children={(field) => (
						<RadioGroup
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value as "tou" | "spot")}
							className="flex flex-col gap-3 sm:flex-row sm:gap-6"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="tou" id="pricing-tou" />
								<Label htmlFor="pricing-tou" className="cursor-pointer">
									Zeittarif (TOU)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="spot" id="pricing-spot" />
								<Label htmlFor="pricing-spot" className="cursor-pointer">
									Spotpreise (Börsenpreis)
								</Label>
							</div>
						</RadioGroup>
					)}
				/>
			</FieldGroup>

			{/* Template Selector - only for TOU mode */}
			<form.Subscribe
				selector={(state) => state.values.pricingMode}
				children={(pricingMode) =>
					pricingMode === "tou" &&
					templates.length > 0 && (
						<FieldGroup>
							<h3 className="font-medium text-lg">Vorlage</h3>
							<Field>
								<FieldLabel>Tarifvorlage auswählen</FieldLabel>
								<FieldDescription>
									Wählen Sie eine Vorlage aus, um die Werte zu übernehmen. Sie können die Werte danach
									anpassen.
								</FieldDescription>
								<Select onValueChange={handleTemplateSelect}>
									<SelectTrigger className="w-full md:w-[300px]">
										<SelectValue placeholder="Vorlage auswählen..." />
									</SelectTrigger>
									<SelectContent>
										{templates.map((template) => (
											<SelectItem key={template.id} value={template.id}>
												{template.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</FieldGroup>
					)
				}
			/>

			{/* Basic Pricing - Base Price always shown */}
			<FieldGroup>
				<h3 className="font-medium text-lg">Grundpreis</h3>
				<form.Field
					name="basePrice"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Grundpreis (Euro/Monat)</FieldLabel>
								<FieldDescription>Fester monatlicher Grundpreis Ihres Stromanbieters</FieldDescription>
								<Input
									type="number"
									inputMode="decimal"
									step="0.01"
									className="w-full md:w-[200px]"
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

			{/* Spot Pricing Settings */}
			<form.Subscribe
				selector={(state) => state.values.pricingMode}
				children={(pricingMode) =>
					pricingMode === "spot" && (
						<FieldGroup>
							<h3 className="font-medium text-lg">Spotpreis-Einstellungen</h3>
							<form.Field
								name="spotMarkup"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>Anbieter-Aufschlag (ct/kWh)</FieldLabel>
											<FieldDescription>
												Ihr Stromanbieter addiert diesen Aufschlag zum Börsenpreis. Typisch sind
												1-5 ct/kWh.
											</FieldDescription>
											<Input
												type="number"
												inputMode="decimal"
												step="0.1"
												min="0"
												max="50"
												className="w-full md:w-[200px]"
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
							<Alert>
								<InfoIcon className="size-4" />
								<AlertDescription>
									Spotpreise werden automatisch von SMARD.de (Bundesnetzagentur) geladen. Die Preise
									werden in 15-Minuten-Intervallen aktualisiert und entsprechen den Day-Ahead-Preisen
									der Strombörse EPEX SPOT für Deutschland/Luxemburg.
								</AlertDescription>
							</Alert>
						</FieldGroup>
					)
				}
			/>

			{/* TOU Settings - only shown in TOU mode */}
			<form.Subscribe
				selector={(state) => state.values.pricingMode}
				children={(pricingMode) =>
					pricingMode === "tou" && (
						<>
							{/* Standard Price */}
							<FieldGroup>
								<h3 className="font-medium text-lg">Standardpreis</h3>
								<form.Field
									name="standardPrice"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel>Standardpreis (ct/kWh)</FieldLabel>
												<FieldDescription>
													Fallback-Preis wenn keine Preiszone gilt
												</FieldDescription>
												<Input
													type="number"
													inputMode="decimal"
													step="0.01"
													className="w-full md:w-[200px]"
													value={
														Number.isFinite(field.state.value as number)
															? (field.state.value as number)
															: ""
													}
													onBlur={field.handleBlur}
													onChange={(e) => {
														const next =
															e.target.value === ""
																? Number.NaN
																: parseFloat(e.target.value);
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

							{/* Default Zones */}
							<FieldGroup>
								<h3 className="font-medium text-lg">Standard-Preiszonen</h3>
								<FieldDescription>
									Definieren Sie die Standard-Preiszonen. Für Nachtstrom kann die Endzeit vor der
									Startzeit liegen (z.B. 22:00 - 06:00). Zeiten ohne Zone verwenden den Standardpreis.
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
																onChange={(e) =>
																	startField.handleChange(e.target.value)
																}
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
																		Number.isFinite(
																			priceField.state.value as number,
																		)
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
												onClick={() =>
													field.pushValue({ start: "22:00", end: "06:00", price: 20 })
												}
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
									Optional: Definieren Sie abweichende Preiszonen für einzelne Wochentage (z.B.
									günstigere Wochenendtarife). Wenn nicht aktiviert, werden die Standard-Preiszonen
									verwendet.
								</FieldDescription>
								<Accordion type="multiple" className="w-full">
									{Weekdays.map((weekday) => (
										<WeekdayZonesField key={weekday} weekday={weekday} form={form} />
									))}
								</Accordion>
							</FieldGroup>
						</>
					)
				}
			/>

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
