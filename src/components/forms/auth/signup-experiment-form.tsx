"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ElectricityMeter, ElectricityMeterDisplay, type ElectricityMeterValue } from "@/lib/enums";
import { signupExperimentSchema } from "@/lib/schemas/auth-schema";
import { signupExperimentAction } from "@/server/actions/auth";

export default function SignUpExperimentForm() {
	const router = useRouter();

	const defaultValues: z.input<typeof signupExperimentSchema> = {
		firstname: "",
		lastname: "",
		mail: "",
		phone: undefined,
		address: "",
		electricityMeterType: ElectricityMeter.Digital,
		electricityMeterNumber: "",
		file: new File([], ""),
		hasWifi: false,
		hasPower: false,
		comment: undefined,
		password: "",
		passwordRepeat: "",
		participation: false,
		tos: false,
		pin: false,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: signupExperimentSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Anmelden...", { duration: Infinity });
			const fd = new FormData();
			for (const key in value) {
				const v = value[key as keyof typeof value] as unknown;
				if (v === undefined) continue;
				if (typeof v === "boolean") {
					fd.append(key, v ? "true" : "false");
				} else if (v instanceof File) {
					fd.append(key, v);
				} else {
					// strings, numbers
					fd.append(key, String(v));
				}
			}
			const res = await signupExperimentAction(fd);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else if (res.path) {
				toast.success(res.message, { id: toastId, duration: 4000 });
				router.push(res.path);
			}
		},
	});

	const pending = form.state.isSubmitting;

	return (
		<form
			method="POST"
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{/* Personal Info */}
			<p className="text-lg font-medium">Persönliche Informationen</p>
			<Separator />
			<FieldGroup className="grid grid-cols-1 gap-2 md:grid-cols-2">
				<form.Field
					name="firstname"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Vorname</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="lastname"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Nachname</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="mail"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
								<FieldDescription>Ihre E-Mail wird benötigt, um sich anzumelden.</FieldDescription>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									autoComplete="email"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="phone"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Telefonnummer (optional)</FieldLabel>
								<FieldDescription>
									Ihre Telefonnummer ermöglicht es uns, Sie einfach zu kontaktieren.
								</FieldDescription>
								<Input
									id={field.name}
									name={field.name}
									type="tel"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="address"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Adresse</FieldLabel>
								<FieldDescription>
									Wir benötigen Ihre Adresse, um den Sensor am Stromzähler zu installieren.
								</FieldDescription>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			{/* Installation Info */}
			<div className="pb-4" />
			<p className="text-lg font-medium">Zähler-Informationen</p>
			<Separator />
			<FieldGroup>
				<form.Field
					name="electricityMeterType"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Stromzähler</FieldLabel>
								<Select
									onValueChange={(v) => field.handleChange(v as ElectricityMeter)}
									value={field.state.value}
								>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie ihren Stromzähler" />
									</SelectTrigger>
									<SelectContent>
										{(Object.values(ElectricityMeter) as [ElectricityMeterValue]).map((value) => (
											<SelectItem value={value} key={value}>
												{ElectricityMeterDisplay[value]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Subscribe
					selector={(state) => state.values.electricityMeterType === ElectricityMeter.Digital}
					children={(s) => (
						<>
							{s ? (
								<form.Field
									name="electricityMeterNumber"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Zählernummer</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
												/>
												<FieldDescription>
													Für die Aktivierung eines Digitalen Zählers, benötigen wir Ihre
													Zählernummer. Diese befindet sich auf Ihrem Zähler.
												</FieldDescription>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
							) : null}
						</>
					)}
				/>

				<form.Field
					name="file"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Foto von Ihrem Stromzähler</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="file"
									accept="image/*"
									onChange={(e) =>
										field.handleChange(e.target.files?.[0] ? e.target.files[0] : new File([], ""))
									}
								/>
								<FieldDescription>
									Sie müssen ein Foto von Ihrem Stromzähler anhängen, dies erleichtert uns die
									Installation ihres Sensors. Auf dem Foto sollte der Hersteller, sowie die
									Zählernummer erkenntlich sein.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				<form.Field
					name="hasWifi"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						const selValue =
							field.state.value !== undefined ? (field.state.value ? "true" : "false") : undefined;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>WLAN vorhanden?</FieldLabel>
								<Select onValueChange={(v) => field.handleChange(v === "true")} value={selValue}>
									<SelectTrigger>
										<SelectValue placeholder="Wählen..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">WLAN vorhanden</SelectItem>
										<SelectItem value="false">Kein WLAN vorhanden</SelectItem>
									</SelectContent>
								</Select>
								<FieldDescription>
									Ist eine stabile WLAN-Verbindung an ihrem Stromzähler vorhanden?
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				<form.Field
					name="hasPower"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						const selValue =
							field.state.value !== undefined ? (field.state.value ? "true" : "false") : undefined;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Steckdose vorhanden?</FieldLabel>
								<Select onValueChange={(v) => field.handleChange(v === "true")} value={selValue}>
									<SelectTrigger>
										<SelectValue placeholder="Wählen..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">Steckdose vorhanden</SelectItem>
										<SelectItem value="false">Keine Steckdose vorhanden</SelectItem>
									</SelectContent>
								</Select>
								<FieldDescription>
									Befindet sich in der Nähe ihres Stromzählers eine Steckdose? Sollte dies nicht der
									Fall sein, erhalten sie von uns einen Akku, um den Sensor damit zu betreiben.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>

				<form.Field
					name="comment"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Zusätzliche Informationen (optional)</FieldLabel>
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			{/* Password */}
			<div className="pb-4" />
			<p className="text-lg font-medium">Sicherheit</p>
			<Separator />
			<FieldGroup>
				<form.Field
					name="password"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Passwort</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									autoComplete="new-password"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="passwordRepeat"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Password wiederholen</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									autoComplete="new-password"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			{/* Survey */}
			<div className="pb-4" />
			<p className="text-lg font-medium">Umfrage</p>
			<Separator />
			<FieldGroup>
				<form.Field
					name="participation"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<div className="flex flex-row items-center justify-between">
									<FieldLabel>Ich möchte an der Umfrage teilnehmen</FieldLabel>
									<Switch
										checked={Boolean(field.state.value)}
										onCheckedChange={(c) => field.handleChange(c === true)}
									/>
								</div>
								<FieldDescription>
									Durch die Teilnahme an der Umfrage tragen Sie dazu bei, Forschungen im Bereich
									Energie vorranzutreiben. Teilnehmer, die an einer Umfrage teilnehmen, werden von uns
									priorisiert an das System angeschlossen.
								</FieldDescription>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			{/* Legal */}
			<div className="pb-4" />
			<p className="text-lg font-medium">Rechtliches</p>
			<Separator />
			<FieldGroup>
				<form.Field
					name="tos"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field className="space-y-0" data-invalid={isInvalid}>
								<div className="flex flex-row items-center gap-2 ">
									<Checkbox
										checked={Boolean(field.state.value)}
										onCheckedChange={(c) => field.handleChange(c === true)}
									/>
									<FieldLabel className="text-sm" htmlFor={field.name}>
										Ich habe die{" "}
										<Link
											className={buttonVariants({ variant: "link" })}
											href="/privacy"
											target="_blank"
										>
											Datenschutzrichtlinien
										</Link>{" "}
										gelesen und akzeptiere diese.
									</FieldLabel>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Subscribe
					selector={(state) => state.values.electricityMeterType === ElectricityMeter.Digital}
					children={(s) => (
						<>
							{s ? (
								<form.Field
									name="pin"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field className="space-y-0" data-invalid={isInvalid}>
												<div className="flex flex-row items-center gap-2">
													<Checkbox
														checked={Boolean(field.state.value)}
														onCheckedChange={(c) => field.handleChange(c === true)}
													/>
													<FieldLabel className="text-sm">
														Ich bin damit einverstanden, dass der Freischaltungs-PIN meines
														Stormzählers in meinem Namen beantragt wird.
													</FieldLabel>
												</div>
												<FieldDescription>
													Der PIN wird von Ihrem Stromanbieter zur Verfügung gestellt. Dieser
													wird dafür benötigt, dass die genauen Daten ihres Zählers ausgelesen
													werden können.
												</FieldDescription>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
							) : null}
						</>
					)}
				/>
			</FieldGroup>

			<div className="pb-4" />
			<div className="flex flex-col items-center gap-4">
				<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
					{pending ? <Loader2Icon className="size-4" /> : null}
					Konto erstellen
				</Button>
			</div>
		</form>
	);
}
