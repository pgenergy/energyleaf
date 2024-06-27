"use client";

import { signInAction, signInDemoAction } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { loginSchema } from "@/lib/schema/auth";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [demoPending, setDemoPending] = useTransition();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            mail: "",
            password: "",
        },
    });

    function onDemo() {
        setDemoPending(() => {
            toast.promise(signInDemoAction, {
                loading: "Starte Demo...",
                success: "Demo gestartet",
                error: "Fehler beim Starten der Demo",
            });
        });
    }

    async function signInActionCallback(mail: string, password: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await signInAction(mail, password);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof loginSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(signInActionCallback(data.mail, data.password), {
                loading: "Anmelden...",
                success: "Erfolgreich angemeldet",
                error: (err: Error) => {
                    setError(err.message);
                    return err.message;
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Willkommen bei Energyleaf!</p>
            <p className="mb-2 text-muted-foreground">Bitte loggen Sie sich ein, um fortzufahren.</p>
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
                        {error ? <p className="text-destructive text-sm">{error}</p> : null}
                        <SubmitButton pending={pending} text="Anmelden" />
                        <p className="text-muted-foreground text-sm">
                            Noch kein Konto?{" "}
                            <Link className="underline hover:no-underline" href="/signup">
                                Konto erstellen
                            </Link>
                        </p>
                        <p className="text-muted-foreground text-sm">
                            <Link className="underline hover:no-underline" href="/forgot">
                                Passwort vergessen?
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
            <div className="mt-4 flex flex-col border-border border-t pt-4 text-muted-foreground text-sm">
                <p>Sie können sich auch eine Demo ansehen mit einem Klick auf den Button unten.</p>
                <Button className="text-sm" disabled={demoPending} onClick={onDemo} type="button" variant="link">
                    {demoPending ? "Starte Demo..." : "Demo starten"}
                </Button>
            </div>
        </div>
    );
}
