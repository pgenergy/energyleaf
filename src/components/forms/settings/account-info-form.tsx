"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeZoneType, TimeZoneTypeDisplay, TimezoneTypeValue } from "@/lib/enums";
import { accountInfoSchema } from "@/lib/schemas/profile-schema";
import { updateAccountInfoAction } from "@/server/actions/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof accountInfoSchema>;
}

export default function AccountInfoForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof accountInfoSchema>>({
		resolver: zodResolver(accountInfoSchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof accountInfoSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateAccountInfoAction(data);
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
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Adresse</FormLabel>
							<FormControl>
								<Input autoComplete="address-line1" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Telefonnummer (optional)</FormLabel>
							<FormControl>
								<Input autoComplete="tel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="timezone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Zeitzone</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Wählen Sie Ihre Zeitzone" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{(Object.values(TimeZoneType) as [TimezoneTypeValue]).map((value) => (
										<SelectItem value={value} key={value}>
											{TimeZoneTypeDisplay[value]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
