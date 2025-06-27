"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { reportConfigSchema } from "@/lib/schemas/profile-schema";
import { updateReportConfigAction } from "@/server/actions/reports";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, setDay } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof reportConfigSchema>;
}

export default function ReportConfigForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof reportConfigSchema>>({
		resolver: zodResolver(reportConfigSchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof reportConfigSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateReportConfigAction(data);
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
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="active"
					render={({ field }) => (
						<FormItem>
							<div className="flex flex-row items-center justify-between gap-4">
								<div className="flex flex-col gap-2">
									<FormLabel>Aktiv</FormLabel>
									<FormDescription>Sollen Berichte erstellt werden?</FormDescription>
									<FormMessage />
								</div>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</div>
						</FormItem>
					)}
				/>
				<FormItem>
					<FormLabel>Tage</FormLabel>
					<FormDescription>Welche Tage sollen Berichte erstellt werden?</FormDescription>
					<ToggleGroup
						type="multiple"
						className="flex flex-row flex-wrap justify-start"
						onValueChange={(days) =>
							form.setValue(
								"days",
								days.map((d) => Number(d))
							)
						}
						value={form.watch().days.map((d) => d.toString())}
					>
						{([1, 2, 3, 4, 5, 6, 0] as number[]).map((day) => (
							<ToggleGroupItem
								key={day}
								value={day.toString()}
								variant="outline"
								className="data-[state=on]:bg-primary data-[state=on]:text-foreground cursor-pointer"
							>
								{format(setDay(new Date(), day), "EEEE", { locale: de })}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</FormItem>
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
