"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas/auth-schema";
import { demoLoginAction, loginAction } from "@/server/actions/auth";

export default function LoginForm() {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			mail: "",
			password: "",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Anmelden...", { duration: Infinity });
			const res = await loginAction(value.mail, value.password);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
				if (res.path) router.push(res.path);
			}
		},
	});

	async function startDemoLogin() {
		const toastId = toast.loading("Demo-Anmeldung...", { duration: Infinity });
		const res = await demoLoginAction();
		if (!res.success) {
			toast.error(res.message, { id: toastId, duration: 4000 });
		} else {
			toast.success(res.message, { id: toastId, duration: 4000 });
			if (res.path) router.push(res.path);
		}
	}

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
			<FieldGroup>
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
									autoComplete="current-password"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			<div className="flex flex-col items-center gap-4">
				<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
					{pending ? <Loader2Icon className="size-4" /> : null}
					Anmelden
				</Button>
			</div>
			<Button
				type="button"
				variant="secondary"
				className="w-full cursor-pointer"
				onClick={startDemoLogin}
				disabled={pending}
			>
				{pending ? <Loader2Icon className="size-4" /> : null}
				Demo Starten
			</Button>
		</form>
	);
}
