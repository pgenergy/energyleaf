"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { energyGoalSchema } from "@/lib/schemas/profile-schema";
import { updateEnergyGoalAction } from "@/server/actions/goals";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof energyGoalSchema>;
}

export default function EnergyGoalForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof energyGoalSchema>>({
		resolver: zodResolver(energyGoalSchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof energyGoalSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateEnergyGoalAction(data);
			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else if (res.payload) {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				form.setValue("energy", res.payload);
			}
		});
	}

	return (
		<Form {...form}>
			<form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="cost"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Zielkosten</FormLabel>
							<FormDescription>
								Betrag in Euro, den Sie maximal pro Monat für die Energie-Kosten ausgeben möchten.
							</FormDescription>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="energy"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Zielverbrauch</FormLabel>
							<FormDescription>
								Dieser Wert errechnet sich nach dem Sie ihre gewünschte Energie-Kosten-Zielwert
								eingegeben haben.
							</FormDescription>
							<FormControl>
								<Input type="number" disabled {...field} />
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
