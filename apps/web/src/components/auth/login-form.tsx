"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { loginSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            mail: "",
            password: "",
        },
    });

    function onSubmit(data: z.infer<typeof loginSchema>) {
        startTransition(() => {
            track("signIn()");
            toast.promise(signInAction(data.mail, data.password), {
                loading: "Anmelden...",
                success: "Erfolgreich angemeldet",
                error: (err) => {
                    setError((err as unknown as Error).message);
                    return "Fehler beim Anmelden";
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Willkommen bei Energyleaf!</p>
            <p className="mb-2 text-muted-foreground">Bitte logge dich ein, um fortzufahren.</p>
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="mail"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="E-Mail" type="email" {...field} />
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
                                <FormControl>
                                    <Input placeholder="Passwort" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col items-center gap-4">
                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        <Button className="w-full" disabled={pending} type="submit">
                            {pending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Anmelden
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Noch kein Konto?{" "}
                            <Link className="underline hover:no-underline" href="/signup">
                                Konto erstellen
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
