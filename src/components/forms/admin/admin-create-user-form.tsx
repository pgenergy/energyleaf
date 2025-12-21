"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { adminCreateUserSchema } from "@/lib/schemas/admin-schema";
import { adminCreateUserAction } from "@/server/actions/admin";

export default function AdminCreateUserForm() {
	const router = useRouter();
	const defaultValues: z.input<typeof adminCreateUserSchema> = {
		firstname: "",
		lastname: "",
		mail: "",
		address: "",
		password: "",
		passwordRepeat: "",
		isAdmin: false,
		isParticipant: false,
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: adminCreateUserSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Nutzer wird erstellt...", { duration: Infinity });
			const res = await adminCreateUserAction(value);
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
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{/* Personal Info */}
			<p className="text-lg font-medium">Persönliche Informationen</p>
			<Separator />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<FieldGroup>
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
										autoComplete="given-name"
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
										autoComplete="family-name"
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
									<Input
										id={field.name}
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										autoComplete="email"
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
								<Field className="col-span-1 md:col-span-2" data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Adresse</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										autoComplete="street-address"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</FieldGroup>
			</div>

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
									autoComplete="new-password"
									aria-invalid={isInvalid}
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
								<FieldLabel htmlFor={field.name}>Passwort wiederholen</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									autoComplete="new-password"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			{/* Permissions */}
			<div className="pb-4" />
			<p className="text-lg font-medium">Berechtigungen</p>
			<Separator />
			<FieldGroup>
				<form.Field
					name="isAdmin"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<FieldLabel htmlFor={field.name}>Administrator</FieldLabel>
									<FieldDescription>
										Administratoren haben Zugriff auf die Admin-Bereiche.
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
				<form.Field
					name="isParticipant"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<FieldLabel htmlFor={field.name}>Teilnehmer</FieldLabel>
									<FieldDescription>
										Markiert den Benutzer als Teilnehmer einer Studie.
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

			<div className="pb-4" />
			<div className="flex flex-row items-center justify-end">
				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? <Loader2Icon className="mr-2 size-4" /> : null}
					Nutzer erstellen
				</Button>
			</div>
		</form>
	);
}
