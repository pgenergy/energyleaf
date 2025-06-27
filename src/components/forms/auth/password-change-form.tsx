"use client";

import { passwordChangeSchema } from "@/lib/schemas/auth-schema";
import { changePasswordAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";

export default function PasswordChangeForm() {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof passwordChangeSchema>>({
		resolver: zodResolver(passwordChangeSchema),
	});

	function onSubmit(data: z.infer<typeof passwordChangeSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Passwort wird zurückgesetzt...", {
				duration: Infinity,
			});
			const res = await changePasswordAction(data);
			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
				form.setValue("oldPassword", "");
			} else {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				form.setValue("password", "");
				form.setValue("passwordRepeat", "");
				form.setValue("oldPassword", "");
			}
		});
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Neues Passwort</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="passwordRepeat"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Neues Passwort Wiederholen</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="oldPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Aktuelles Passwort</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-row items-center justify-end gap-4">
					<Button type="submit" className="cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Passwort ändern
					</Button>
				</div>
			</form>
		</Form>
	);
}
