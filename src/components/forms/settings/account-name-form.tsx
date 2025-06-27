"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { accountNameSchema } from "@/lib/schemas/profile-schema";
import { updateAccountNameAction } from "@/server/actions/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
	initialValues: z.infer<typeof accountNameSchema>;
}

export default function AccountNameForm(props: Props) {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof accountNameSchema>>({
		resolver: zodResolver(accountNameSchema),
		defaultValues: {
			...props.initialValues,
		},
	});

	function onSubmit(data: z.infer<typeof accountNameSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Speichern...", {
				duration: Infinity,
			});
			const res = await updateAccountNameAction(data);
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
					name="firstname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Vorname</FormLabel>
							<FormControl>
								<Input autoComplete="given-name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nachname</FormLabel>
							<FormControl>
								<Input autoComplete="family-name" {...field} />
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
