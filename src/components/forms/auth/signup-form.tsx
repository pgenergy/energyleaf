"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signupSchema } from "@/lib/schemas/auth-schema";
import { signupAction } from "@/server/actions/auth";

export default function SignUpForm() {
	const router = useRouter();
	const defaultValues: z.input<typeof signupSchema> = {
		firstname: "",
		lastname: "",
		mail: "",
		address: "",
		password: "",
		passwordRepeat: "",
		tos: false,
	};
	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: signupSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Anmelden...", { duration: Infinity });
			const res = await signupAction(value);
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
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
						name="address"
						children={(field) => {
							const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field className="col-span-1 md:col-span-2" data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Adresse</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										autoComplete="street-address"
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
