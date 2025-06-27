"use client";

import { loginSchema } from "@/lib/schemas/auth-schema";
import { demoLoginAction, loginAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";

export default function LoginForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
	});

	function onSubmit(data: z.infer<typeof loginSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Anmelden...", {
				duration: Infinity,
			});
			const res = await loginAction(data.mail, data.password);
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

	function startDemoLogin() {
		startTransition(async () => {
			const toastId = toast.loading("Demo-Anmeldung...", {
				duration: Infinity,
			});
			const res = await demoLoginAction();
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
			<form method="POST" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
				<div className="flex flex-col items-center gap-4">
					<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Anmelden
					</Button>
				</div>
				<Button type="button" variant="secondary" className="w-full cursor-pointer" onClick={startDemoLogin}>
					{pending ? <Loader2Icon className="size-4" /> : null}
					Demo Starten
				</Button>
			</form>
		</Form>
	);
}
