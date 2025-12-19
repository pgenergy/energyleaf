"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { adminAccountStatusSchema } from "@/lib/schemas/profile-schema";
import { adminUpdateAccountStatusAction } from "@/server/actions/admin";

interface Props {
	userId: string;
	initialValues: z.infer<typeof adminAccountStatusSchema>;
}

export default function AdminAccountStatusForm({ userId, initialValues }: Props) {
	const form = useForm({
		defaultValues: { ...initialValues },
		validators: { onSubmit: adminAccountStatusSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Speichern...", { duration: Infinity });
			const res = await adminUpdateAccountStatusAction(userId, value);
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
					name="isActive"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<FieldLabel htmlFor={field.name}>Aktiv</FieldLabel>
									<FieldDescription>
										Aktivierte Benutzer können sich anmelden und die Plattform nutzen.
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
				<form.Field
					name="isSimulationFree"
					children={(field) => (
						<Field>
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<FieldLabel htmlFor={field.name}>Simulation</FieldLabel>
									<FieldDescription>
										Ermöglicht dem Benutzer den Zugriff auf Simulationsfunktionen.
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
			<div className="flex flex-row items-center justify-end">
				<Button type="submit" disabled={pending} className="cursor-pointer">
					{pending ? <Loader2Icon className="size-4" /> : null}
					Speichern
				</Button>
			</div>
		</form>
	);
}
