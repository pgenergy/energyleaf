"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { anomalySchema } from "@/lib/schemas/profile-schema";
import { updateAnomalyAction } from "@/server/actions/reports";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof anomalySchema>;
}

export default function AnomalyForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof anomalySchema>>({
		resolver: zodResolver(anomalySchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof anomalySchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateAnomalyAction(data);
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
			<form className="grid grid-cols-1 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="active"
					render={({ field }) => (
						<FormItem>
							<div className="flex flex-row items-center justify-between gap-4">
								<div className="flex flex-col gap-2">
									<FormLabel>Aktiv</FormLabel>
									<FormDescription>
										Sollen E-Mails zur Anomalieerkennung versendet werden?
									</FormDescription>
									<FormMessage />
								</div>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</div>
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
