"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TariffType, TariffTypeDisplay, TariffTypeValue } from "@/lib/enums";
import { energyTarfiffSchema } from "@/lib/schemas/profile-schema";
import { updateEnergyTariffAction } from "@/server/actions/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof energyTarfiffSchema>;
}

export default function EnergyTariffForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof energyTarfiffSchema>>({
		resolver: zodResolver(energyTarfiffSchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof energyTarfiffSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateEnergyTariffAction(data);
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
			}
		});
	}

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="tariffType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tariftyp</FormLabel>
							<FormDescription>Welche Art von Tarif besitzen Sie</FormDescription>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie Ihren Tarif" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{(Object.values(TariffType) as [TariffTypeValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{TariffTypeDisplay[value]}
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
					name="basePrice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Monatlicher Basispreis</FormLabel>
							<FormDescription>Angabe in Euro</FormDescription>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="workingPrice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Arbeitspreis</FormLabel>
							<FormDescription>Angabe in Euro pro kWh</FormDescription>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="monthlyPayment"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Monatlicher Abschlag</FormLabel>
							<FormDescription>Angabe in Euro pro kWh</FormDescription>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="col-span-1 flex flex-row items-center justify-end md:col-span-2">
					<Button type="submit" disabled={pending} className="cursor-pointer">
						{pending ? <Loader2Icon className="size-4" /> : null}
						Speichern
					</Button>
				</div>
			</form>
		</Form>
	);
}
