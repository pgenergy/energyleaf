"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import type { loginSchema } from "@/lib/schema/auth";
import { track } from "@vercel/analytics";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

interface Props {
    form: UseFormReturn<z.infer<typeof loginSchema>>;
}

export default function LoginForm({ form }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function onSubmit(data: z.infer<typeof loginSchema>) {
        setError("");
        startTransition(() => {
            track("signIn()");
            toast.promise(signInAction(data.mail, data.password), {
                loading: "Anmelden...",
                success: "Erfolgreich angemeldet",
                error: () => {
                    setError("E-Mail oder Passwort ist falsch");
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
                        <SubmitButton pending={pending} text="Anmelden" />
                        <p className="text-sm text-muted-foreground">
                            Noch kein Konto?{" "}
                            <Link className="underline hover:no-underline" href="/signup">
                                Konto erstellen
                            </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <Link className="underline hover:no-underline" href="/forgot">
                                Passwort vergessen?
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
            <div className="mt-4 flex flex-col border-t border-border pt-4 text-sm text-muted-foreground">
                <p>Sie können sich auch eine Demo ansehen mit einem Klick auf den Button unten.</p>
                <Button
                    className="text-sm"
                    onClick={() => {
                        onSubmit({ mail: "demo@energyleaf.de", password: "demo" });
                    }}
                    variant="link"
                >
                    Demo starten
                </Button>
            </div>
        </div>
    );
}
