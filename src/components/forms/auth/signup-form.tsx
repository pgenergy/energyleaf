"use client";

import { signupSchema } from "@/lib/schemas/auth-schema";
import { signupAction } from "@/server/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";

export default function SignUpForm() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			tos: false,
		},
	});

	function onSubmit(data: z.infer<typeof signupSchema>) {
		startTransition(async () => {
			const toastId = toast.loading("Anmelden...", {
				duration: Infinity,
			});
			const res = await signupAction(data);
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
				{/* Personal Info */}
				<p className="text-lg font-medium">Persönliche Informationen</p>
				<Separator />
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
					<FormField
						control={form.control}
						name="firstname"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Vorname</FormLabel>
								<FormControl>
									<Input {...field} />
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
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="mail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-Mail</FormLabel>
								<FormDescription>Ihre E-Mail ist notwendig, um sich anzumelden.</FormDescription>
								<FormControl>
									<Input type="email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="address"
						render={({ field }) => (
							<FormItem className="col-span-1 md:col-span-2">
								<FormLabel>Adresse</FormLabel>
								<FormDescription>
									Wir benötigen Ihre Adresse, um den Sensor am Stromzähler zu installieren.
								</FormDescription>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{/* Password */}
				<div className="pb-4" />
				<p className="text-lg font-medium">Sicherheit</p>
				<Separator />
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
							<FormLabel>Password wiederholen</FormLabel>
							<FormControl>
								<Input type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Legal */}
				<div className="pb-4" />
				<p className="text-lg font-medium">Rechtliches</p>
				<Separator />
				<FormField
					control={form.control}
					name="tos"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center gap-2 space-y-0">
							<FormControl>
								<Checkbox checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
							<FormLabel className="text-sm">
								Ich habe die{" "}
								<Link className={buttonVariants({ variant: "link" })} href="/privacy" target="_blank">
									Datenschutzrichtlinien
								</Link>{" "}
								gelesen und akzeptiere diese.
							</FormLabel>
						</FormItem>
					)}
				/>
				<div className="pb-4" />
				<div className="flex flex-col items-center gap-4">
					<Button type="submit" className="w-full cursor-pointer" disabled={pending}>
						{pending ? <Loader2Icon className="size-4" /> : null}
						Konto erstellen
					</Button>
				</div>
			</form>
		</Form>
	);
}
