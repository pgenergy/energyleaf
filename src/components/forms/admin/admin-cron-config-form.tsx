"use client";

import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateCronConfigAction } from "@/server/actions/config";

const cronConfigSchema = z.object({
	baseUrl: z.string().url("Bitte geben Sie eine gültige URL ein."),
	secretKey: z.string().min(16, "Der Secret Key muss mindestens 16 Zeichen lang sein."),
});

interface Props {
	initialBaseUrl: string;
	hasExistingSecretKey: boolean;
}

export default function AdminCronConfigForm({ initialBaseUrl, hasExistingSecretKey }: Props) {
	const [showSecret, setShowSecret] = useState(false);

	const form = useForm({
		defaultValues: {
			baseUrl: initialBaseUrl,
			secretKey: "",
		},
		validators: {
			onSubmit: cronConfigSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await updateCronConfigAction(value);
			if (!res.success) {
				toast.error(res.message, { id: toastId, duration: 4000 });
			} else {
				toast.success(res.message, { id: toastId, duration: 4000 });
				// Clear secret key field after successful save
				form.setFieldValue("secretKey", "");
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
					name="baseUrl"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Base URL</FieldLabel>
								<FieldDescription>
									Die Basis-URL für die Cron-Jobs (z.B. https://energyleaf.de/api)
								</FieldDescription>
								<Input
									type="url"
									placeholder="https://example.com/api"
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
					name="secretKey"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel>Secret Key</FieldLabel>
								<FieldDescription>
									Der Secret Key wird verwendet, um die Cron-API-Anfragen zu authentifizieren.
									{hasExistingSecretKey && " Es ist bereits ein Secret Key gesetzt."}
								</FieldDescription>
								<div className="relative">
									<Input
										type={showSecret ? "text" : "password"}
										placeholder={
											hasExistingSecretKey
												? "Neuen Secret Key eingeben..."
												: "Secret Key eingeben..."
										}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										className="pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-0 top-0 h-full cursor-pointer hover:bg-transparent"
										onClick={() => setShowSecret(!showSecret)}
									>
										{showSecret ? (
											<EyeOffIcon className="size-4" />
										) : (
											<EyeIcon className="size-4" />
										)}
									</Button>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
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
