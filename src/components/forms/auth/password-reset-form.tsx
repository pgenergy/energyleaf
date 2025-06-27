"use client";

import { passwordResetSchema } from "@/lib/schemas/auth-schema";
import { resetPasswordAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";

export default function PasswordResetForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const form = useForm<z.infer<typeof passwordResetSchema>>({
		resolver: zodResolver(passwordResetSchema),
	});

	function onSubmit(data: z.infer<typeof passwordResetSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Passwort wird zurückgesetzt...", {
				duration: Infinity,
			});
			const res = await resetPasswordAction(data.password, searchParams.get("token") || "");
			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else if (res.path) {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				router.push(res.path);
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
							<FormLabel>Passwort</FormLabel>
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
							<FormLabel>Passwort Wiederholen</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col items-center gap-4">
					<Button type="submit" className="cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Passwort zurücksetzen
					</Button>
				</div>
			</form>
		</Form>
	);
}
