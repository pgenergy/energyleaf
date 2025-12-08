"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { passwordForgotSchema } from "@/lib/schemas/auth-schema";
import { forgotPasswordAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function PasswordForgotForm() {
	const form = useForm({
		defaultValues: { mail: "" },
		validators: { onSubmit: passwordForgotSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Sende E-Mail...", { duration: Infinity });
			const res = await forgotPasswordAction(value.mail);
			if (!res) {
				toast.success("E-Mail zum Zurücksetzen des Passworts gesendet.", { id: toastId, duration: 4000 });
				return;
			}
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
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
			</FieldGroup>
			<div className="flex flex-col items-center gap-4">
				<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
					{pending ? <Loader2Icon className="size-4" /> : null}
					Passwort zurücksetzen
				</Button>
			</div>
		</form>
	);
}
