"use client";

import { ElectricityMeter, ElectricityMeterDisplay, ElectricityMeterValue } from "@/lib/enums";
import { signupExperimentSchema } from "@/lib/schemas/auth-schema";
import { signupExperimentAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";

export default function SignUpExperimentForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof signupExperimentSchema>>({
		resolver: zodResolver(signupExperimentSchema),
		defaultValues: {
			file: new File([], ""),
			tos: false,
			pin: false,
			participation: false,
		},
	});

	function onSubmit(data: z.infer<typeof signupExperimentSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Anmelden...", {
				duration: Infinity,
			});
			const form = new FormData();
			for (const key in data) {
				const value = data[key as keyof typeof data];
				if (value === undefined) {
					continue;
				}
				if (typeof value === "boolean") {
					form.append(key, (value as boolean) ? "true" : "false");
				} else {
					form.append(key, value);
				}
			}

			const res = await signupExperimentAction(form);
			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else if (res.path) {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				router.push(res.path);
			}
		});
	}

	return (
		<Form {...form}>
			<form method="POST" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				{/* Personal Info */}
				<p className="text-lg font-medium">Persönliche Informationen</p>
				<Separator />
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
					<FormField
						control={form.control}
						name="firstname"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vorname</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastname"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nachname</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="mail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-Mail</FormLabel>
								<FormDescription>Ihre E-Mail wird benötigt, um sich anzumelden.</FormDescription>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Telefonnummer (optional)</FormLabel>
								<FormDescription>
									Ihre Telefonnummer ermöglicht es uns, Sie einfach zu kontaktieren.
								</FormDescription>
								<FormControl>
									<Input type="tel" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="address"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Adresse</FormLabel>
								<FormDescription>
									Wir benötigen Ihre Adresse, um den Sensor am Stromzähler zu installieren.
								</FormDescription>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{/* Installation Info */}
				<div className="pb-4" />
				<p className="text-lg font-medium">Zähler-Informationen</p>
				<Separator />
				<FormField
					control={form.control}
					name="electricityMeterType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Stromzähler</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie ihren Stromzähler" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{(Object.values(ElectricityMeter) as [ElectricityMeterValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{ElectricityMeterDisplay[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.watch().electricityMeterType === ElectricityMeter.Digital ? (
					<FormField
						control={form.control}
						name="electricityMeterNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Zählernummer</FormLabel>
								<FormControl>
									<Input
										disabled={form.watch().electricityMeterType === ElectricityMeter.Analog}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Für die Aktivierung eines Digitalen Zählers, benötigen wir Ihre Zählernummer. Diese
									befindet sich auf Ihrem Zähler.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}
				<FormField
					control={form.control}
					name="file"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Foto von Ihrem Stromzähler</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept="image/*"
									onChange={(e) => {
										field.onChange(e.target.files ? e.target.files[0] : null);
									}}
								/>
							</FormControl>
							<FormDescription>
								Sie müssen ein Foto von Ihrem Stromzähler anhängen, dies erleichtert uns die
								Installation ihres Sensors. Auf dem Foto sollte der Hersteller, sowie die Zählernummer
								erkenntlich sein.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="hasWifi"
					render={({ field }) => (
						<FormItem>
							<FormLabel>WLAN vorhanden?</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(value === "true");
								}}
								value={field.value !== undefined ? (field.value ? "true" : "false") : undefined}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen..." />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="true">WLAN vorhanden</SelectItem>
									<SelectItem value="false">Kein WLAN vorhanden</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Ist eine stabile WLAN-Verbindung an ihrem Stromzähler vorhanden?
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="hasPower"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Steckdose vorhanden?</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(value === "true");
								}}
								value={field.value !== undefined ? (field.value ? "true" : "false") : undefined}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen..." />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="true">Steckdose vorhanden</SelectItem>
									<SelectItem value="false">Keine Steckdose vorhanden</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Befindet sich in der Nähe ihres Stromzählers eine Steckdose,? Sollte dies nicht der Fall
								sein, erhalten sie von uns einen Akku, um den Sensor damit zu betreiben.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="comment"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Zusätzliche Informationen (optional)</FormLabel>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Password */}
				<div className="pb-4" />
				<p className="text-lg font-medium">Sicherheit</p>
				<Separator />
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Passwort</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="passwordRepeat"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password wiederholen</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="pb-4" />
				<p className="text-lg font-medium">Umfrage</p>
				<Separator />
				<FormField
					control={form.control}
					name="participation"
					render={({ field }) => (
						<FormItem>
							<div className="flex flex-row items-center justify-between">
								<FormLabel>Ich möchte an der Umfrage teilnehmen</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</div>
							<FormDescription>
								Durch die Teilnahme an der Umfrage tragen Sie dazu bei, Forschungen im Bereich Energie
								vorranzutreiben. Teilnehmer, die an einer Umfrage teilnehmen, werden von uns priorisiert
								an das System angeschlossen.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Legal */}
				<div className="pb-4" />
				<p className="text-lg font-medium">Rechtliches</p>
				<Separator />
				<FormField
					control={form.control}
					name="tos"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center gap-2 space-y-0">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<FormLabel className="text-sm">
								Ich habe die{" "}
								<Link className={buttonVariants({ variant: "link" })} href="/privacy" target="_blank">
									Datenschutzrichtlinien
								</Link>{" "}
								gelesen und akzeptiere diese.
							</FormLabel>
						</FormItem>
					)}
				/>
				{form.watch().electricityMeterType === ElectricityMeter.Digital ? (
					<FormField
						control={form.control}
						name="pin"
						render={({ field }) => (
							<FormItem className="space-y-0">
								<div className="flex flex-row items-center gap-2">
									<FormControl>
										<Checkbox checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormLabel className="text-sm">
										Ich bin damit einverstanden, dass der Freischaltungs-PIN meines Stormzählers in
										meinem Namen beantragt wird.
									</FormLabel>
								</div>
								<FormDescription>
									Der PIN wird von Ihrem Stromanbieter zur Verfügung gestellt. Dieser wird dafür
									benötigt, dass die genauen Daten ihres Zählers ausgelesen werden können.
								</FormDescription>
							</FormItem>
						)}
					/>
				) : null}
				<div className="pb-4" />
				<div className="flex flex-col items-center gap-4">
					<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Konto erstellen
					</Button>
				</div>
			</form>
		</Form>
	);
}
