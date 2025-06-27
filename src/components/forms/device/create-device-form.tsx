"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeviceCategory, DeviceCategoryDisplay, DeviceCategoryValue } from "@/lib/enums";
import { deviceSchema } from "@/lib/schemas/device-schema";
import { createDeviceAction, updateDeviceAction } from "@/server/actions/device";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues?: z.infer<typeof deviceSchema>;
	deviceId?: string;
}

export default function DeviceCreationForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const router = useRouter();
	const form = useForm<z.infer<typeof deviceSchema>>({
		resolver: zodResolver(deviceSchema),
		defaultValues: {
			name: props.initialValues?.name,
			category: props.initialValues?.category,
			power: props.initialValues?.power,
		},
	});

	function handleSubmit(data: z.infer<typeof deviceSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Gerät wird gespeichert...", {
				duration: Infinity,
			});
			let res;
			if (props.initialValues && props.deviceId) {
				res = await updateDeviceAction(props.deviceId, data);
			} else {
				res = await createDeviceAction(data);
			}

			if (!res) {
				toast.success("Ein unerwarteter Fehler ist aufgetreten.", {
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
				router.push("/devices");
			}
		});
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gerätename</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tariftyp</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie eine Kategorie aus." />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{(Object.values(DeviceCategory) as [DeviceCategoryValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{DeviceCategoryDisplay[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="power"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Geschätze Leistung</FormLabel>
							<FormDescription>
								Geben Sie hier die geschätzte Leistung Ihres Gerätes an. Wenn Sie diese nicht kennen,
								lassen Sie das Feld leer.
							</FormDescription>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-row items-center justify-end">
					<div>
						<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
							{pending ? <Loader2Icon className="size-4" /> : null}
							{props.initialValues && props.deviceId ? "Speichern" : "Gerät erstellen"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
