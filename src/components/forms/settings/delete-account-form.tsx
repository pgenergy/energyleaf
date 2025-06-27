"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteAccountSchema } from "@/lib/schemas/profile-schema";
import { deleteAccountAction } from "@/server/actions/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function DeleteAccountForm() {
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof deleteAccountSchema>>({
		resolver: zodResolver(deleteAccountSchema),
	});

	function onSubmit(data: z.infer<typeof deleteAccountSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Löschen...", {
				duration: Infinity,
			});
			const res = await deleteAccountAction(data);

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
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div className="flex flex-col gap-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Passwort</FormLabel>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex flex-row items-center justify-end gap-4">
					<Button variant="destructive" type="submit" className="cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Löschen
					</Button>
				</div>
			</form>
		</Form>
	);
}
