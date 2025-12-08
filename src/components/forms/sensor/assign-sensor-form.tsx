"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sensorAssignSchema } from "@/lib/schemas/sensor-schema";
import { assignSensorAction } from "@/server/actions/sensor";
import type { UserForSelect } from "@/server/queries/user";

interface Props {
	clientId: string;
	users: UserForSelect[];
}

export default function SensorAssignForm({ clientId, users }: Props) {
	const router = useRouter();

	const defaultValues: z.input<typeof sensorAssignSchema> = {
		userId: "",
		initialValue: 0,
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: sensorAssignSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading("Sensor wird zugewiesen...", {
				duration: Infinity,
			});

			const res = await assignSensorAction(clientId, value as z.infer<typeof sensorAssignSchema>);

			if (!res) {
				toast.error("Ein unerwarteter Fehler ist aufgetreten.", {
					id: toastId,
					duration: 4000,
				});
				return;
			}

			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				router.push("/admin/sensors");
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
			<form.Field
				name="userId"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel>Nutzer</FieldLabel>
							<FieldDescription>
								Wählen Sie den Nutzer aus, dem der Sensor zugewiesen werden soll.
							</FieldDescription>
							<Select onValueChange={(v) => field.handleChange(v)} value={field.state.value}>
								<SelectTrigger>
									<SelectValue placeholder="Wählen Sie einen Nutzer aus." />
								</SelectTrigger>
								<SelectContent>
									{users.map((user) => (
										<SelectItem value={user.id} key={user.id}>
											{user.username} ({user.email})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<form.Field
				name="initialValue"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Initialer Zählerstand (kWh)</FieldLabel>
							<FieldDescription>
								Geben Sie den aktuellen Zählerstand des Stromzählers ein. Dieser Wert wird als erster
								Messwert gespeichert.
							</FieldDescription>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								step="0.01"
								min="0"
								value={field.state.value !== undefined ? String(field.state.value) : ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value === "" ? 0 : Number(e.target.value))}
								aria-invalid={isInvalid}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<div className="flex flex-row items-center justify-end">
				<div>
					<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
						Nutzer zuweisen
					</Button>
				</div>
			</div>
		</form>
	);
}
