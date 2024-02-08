"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createAccount, signInAction } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import type { signupSchema } from "@/lib/schema/auth";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

interface Props {
    form: UseFormReturn<z.infer<typeof signupSchema>>;
}

export default function SignUpForm({ form }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");

    function onSubmit(data: z.infer<typeof signupSchema>) {
        setError("");

        startTransition(() => {
            toast.promise(
                async () => {
                    await createAccount(data);
                    await signInAction(data.mail, data.password);
                },
                {
                    loading: "Erstelle Konto...",
                    success: "Konto erfolgreich erstellt",
                    error: (err) => {
                        setError((err as unknown as Error).message);
                        return "Konto konnte nicht erstellt werden";
                    },
                },
            );
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Abenteuer beginnt hier!</p>
            <p className="mb-2 text-muted-foreground">Verständnis über den eigenen Energieverbrauch aufbauen.</p>
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Benutzername" {...field} />
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
                    <FormField
                        control={form.control}
                        name="passwordRepeat"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Passwort wiederholen" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col items-center gap-4">
                        {error !== "" ? <p className="text-sm text-destructive">{error}</p> : null}
                        <SubmitButton pending={isPending} text="Konto erstellen" />
                        <p className="text-sm text-muted-foreground">
                            Du hast bereits ein Konto?{" "}
                            <Link className="underline hover:no-underline" href="/">
                                Anmelden
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    );
}
