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
import { Textarea } from "@/components/ui/textarea";
import { SensorType, SensorTypeDisplay, type SensorTypeValue } from "@/lib/enums";
import { sensorSchema } from "@/lib/schemas/sensor-schema";
import { createSensorAction, updateSensorAction } from "@/server/actions/sensor";

interface Props {
	initialValues?: z.infer<typeof sensorSchema>;
	sensorId?: string;
}

const SensorVersions = [
	{ value: "1", label: "Version 1" },
	{ value: "2", label: "Version 2" },
];

export default function SensorCreationForm(props: Props) {
	const router = useRouter();
	const isEditMode = !!props.initialValues && !!props.sensorId;

	const defaultValues: z.input<typeof sensorSchema> = {
		clientId: props.initialValues?.clientId ?? "",
		sensorType: props.initialValues?.sensorType ?? SensorType.Electricity,
		version: props.initialValues?.version ?? "1",
		script: props.initialValues?.script ?? "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: sensorSchema,
		},
		onSubmit: async ({ value }) => {
			const toastId = toast.loading(isEditMode ? "Sensor wird gespeichert..." : "Sensor wird erstellt...", {
				duration: Infinity,
			});

			let res: { success: boolean; message: string };
			if (isEditMode && props.sensorId) {
				res = await updateSensorAction(props.sensorId, {
					sensorType: value.sensorType,
					version: value.version,
					script: value.script,
				});
			} else {
				res = await createSensorAction(value as z.infer<typeof sensorSchema>);
			}

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
				name="clientId"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Client-ID</FieldLabel>
							<FieldDescription>Die eindeutige Client-ID des Sensors.</FieldDescription>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
								disabled={isEditMode}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			/>
			<form.Field
				name="sensorType"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel>Sensortyp</FieldLabel>
							<Select
								onValueChange={(v) => field.handleChange(v as SensorType)}
								value={field.state.value}
							>
								<SelectTrigger>
									<SelectValue placeholder="Wählen Sie einen Sensortyp aus." />
								</SelectTrigger>
								<SelectContent>
									{(Object.values(SensorType) as [SensorTypeValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{SensorTypeDisplay[value]}
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
				name="version"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel>Version</FieldLabel>
							<FieldDescription>
								Version 2 Sensoren erhalten automatisch einen Token für die API-Authentifizierung.
							</FieldDescription>
							<Select onValueChange={(v) => field.handleChange(v as "1" | "2")} value={field.state.value}>
								<SelectTrigger>
									<SelectValue placeholder="Wählen Sie eine Version aus." />
								</SelectTrigger>
								<SelectContent>
									{SensorVersions.map((version) => (
										<SelectItem value={version.value} key={version.value}>
											{version.label}
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
				name="script"
				children={(field) => {
					const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field data-invalid={isInvalid}>
							<FieldLabel htmlFor={field.name}>Script</FieldLabel>
							<FieldDescription>
								Optionales Script für den Sensor. Wenn ein Script angegeben wird, wird der Sensor als
								"Script erforderlich" markiert.
							</FieldDescription>
							<Textarea
								id={field.name}
								name={field.name}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
								rows={6}
								className="font-mono text-sm"
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
						{isEditMode ? "Speichern" : "Sensor erstellen"}
					</Button>
				</div>
			</div>
		</form>
	);
}
