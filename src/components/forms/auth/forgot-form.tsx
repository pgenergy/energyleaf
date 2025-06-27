"use client";

import { passwordForgotSchema } from "@/lib/schemas/auth-schema";
import { forgotPasswordAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";

export default function PasswordForgotForm() {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof passwordForgotSchema>>({
		resolver: zodResolver(passwordForgotSchema),
		defaultValues: {
			mail: "",
		},
	});

	function onSubmit(data: z.infer<typeof passwordForgotSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Sende E-Mail...", {
				duration: Infinity,
			});
			const res = await forgotPasswordAction(data.mail);

			// case user does not exist, we dont give info about that
			if (!res) {
				toast.success("E-Mail zum Zurücksetzen des Passworts gesendet.", {
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
			}
		});
	}

	return (
		<Form {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="mail"
					render={({ field }) => (
						<FormItem>
							<FormLabel>E-Mail</FormLabel>
							<FormControl>
								<Input type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col items-center gap-4">
					<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Passwort zurücksetzen
					</Button>
				</div>
			</form>
		</Form>
	);
}
