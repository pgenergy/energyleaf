"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createAccount } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { signupSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

export default function SignUpForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            mail: "",
            password: "",
            passwordRepeat: "",
            username: "",
        },
    });

    function onSubmit(data: z.infer<typeof signupSchema>) {
        setError("");

        startTransition(() => {
            toast.promise(
                async () => {
                    await createAccount(data);
                },
                {
                    loading: "Erstelle Konto...",
                    success: "Konto erfolgreich erstellt",
                    error: () => {
                        setError("Konto konnte nicht erstellt werden");
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
