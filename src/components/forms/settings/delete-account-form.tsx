"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteAccountSchema } from "@/lib/schemas/profile-schema";
import { deleteAccountAction } from "@/server/actions/account";

export default function DeleteAccountForm() {
	const defaultValues: z.input<typeof deleteAccountSchema> = {
		password: "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: deleteAccountSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Löschen...", { duration: Infinity });
			const res = await deleteAccountAction(value);
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
			method="POST"
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
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
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>

			<div className="flex flex-row items-center justify-end gap-4">
				<Button variant="destructive" type="submit" className="cursor-pointer" disabled={pending}>
					{pending ? <Loader2Icon className="size-4" /> : null}
					Löschen
				</Button>
			</div>
		</form>
	);
}
