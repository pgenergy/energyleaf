"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { touTariffTemplateSchema } from "@/lib/schemas/template-schema";
import { createTouTariffTemplateAction, updateTouTariffTemplateAction } from "@/server/actions/templates";
import type { TouTariffTemplate } from "@/server/db/tables/templates";

type TouTariffTemplateInput = z.input<typeof touTariffTemplateSchema>;
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
	mode: "create" | "edit";
	initialValues?: TouTariffTemplate;
}

export default function AdminTouTemplateForm({ mode, initialValues }: Props) {
	const router = useRouter();

	const defaultValues: TouTariffTemplateInput = {
		name: initialValues?.name ?? "",
		description: initialValues?.description ?? "",
		isActive: initialValues?.isActive ?? true,
		basePrice: initialValues?.basePrice ?? 0,
		standardPrice: initialValues?.standardPrice ?? 0,
		zones: initialValues?.zones ?? [],
		weekdayZones: initialValues?.weekdayZones ?? {},
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: touTariffTemplateSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			let res: { success: boolean; message: string; path?: string };
			if (mode === "create") {
				res = await createTouTariffTemplateAction(value as z.infer<typeof touTariffTemplateSchema>);
			} else {
				if (!initialValues?.id) {
					toast.error("Fehler: Template-ID nicht gefunden", { id: toastId, duration: 4000 });
					return;
				}
				res = await updateTouTariffTemplateAction(
					initialValues.id,
					value as z.infer<typeof touTariffTemplateSchema>,
				);
			}
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
				return;
			}
			toast.success(res.message, { id: toastId, duration: 4000 });
			if (res.path) {
				router.push(res.path);
			}
		},
	});

	const pending = form.state.isSubmitting;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{mode === "create" ? "Neue Vorlage erstellen" : "Vorlage bearbeiten"}</CardTitle>
				<CardDescription>
					{mode === "create"
						? "Erstellen Sie eine neue TOU-Tarif Vorlage, die Nutzer als Preset verwenden können."
						: "Bearbeiten Sie die TOU-Tarif Vorlage."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-6"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{/* Template Info */}
					<FieldGroup>
						<h3 className="font-medium text-lg">Vorlage-Informationen</h3>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field
								name="name"
								children={(field) => {
									const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>Name</FieldLabel>
											<FieldDescription>Eindeutiger Name für die Vorlage</FieldDescription>
											<Input
												type="text"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="z.B. Nachtstrom Standard"
												aria-invalid={isInvalid}
											/>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							/>
							<form.Field
								name="isActive"
								children={(field) => (
									<Field>
										<FieldLabel>Status</FieldLabel>
										<FieldDescription>
											Nur aktive Vorlagen werden Nutzern angezeigt
										</FieldDescription>
										<div className="flex items-center gap-2 pt-2">
											<Switch
												id="isActive"
												checked={field.state.value}
												onCheckedChange={field.handleChange}
											/>
											<Label htmlFor="isActive">{field.state.value ? "Aktiv" : "Inaktiv"}</Label>
										</div>
									</Field>
								)}
							/>
						</div>
						<form.Field
							name="description"
							children={(field) => (
								<Field>
									<FieldLabel>Beschreibung (optional)</FieldLabel>
									<FieldDescription>Kurze Beschreibung des Tarifs für die Nutzer</FieldDescription>
									<Textarea
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="z.B. Günstiger Nachtstrom zwischen 22:00 und 06:00 Uhr"
										rows={2}
									/>
								</Field>
							)}
						/>
					</FieldGroup>

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
											<FieldDescription>
												Fallback-Preis wenn keine Preiszone gilt
											</FieldDescription>
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
							Definieren Sie die Standard-Preiszonen. Für Nachtstrom kann die Endzeit vor der Startzeit
							liegen (z.B. 22:00 - 06:00). Zeiten ohne Zone verwenden den Standardpreis.
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

					<div className="flex flex-row items-center justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/settings/tou-templates")}
							className="cursor-pointer"
						>
							Abbrechen
						</Button>
						<Button type="submit" disabled={pending} className="cursor-pointer">
							{pending ? <Loader2Icon className="size-4" /> : null}
							{mode === "create" ? "Erstellen" : "Speichern"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
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
