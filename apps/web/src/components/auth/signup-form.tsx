"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createAccount, signInAction } from "@/actions/auth";
import { signupSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button, Form, FormControl, FormDescription, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

export default function SignUpForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string>("");
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            mail: "",
            password: "",
            passwordRepeat: "",
            sensorId: "",
            username: "",
        },
    });

    function onSubmit(data: z.infer<typeof signupSchema>) {
        setError("");
        if (data.password !== data.passwordRepeat) {
            form.setError("passwordRepeat", {
                type: "manual",
                message: "Passwörter stimmen nicht überein.",
            });
        }

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
                        name="sensorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Sensor Code" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Du findest den Sensor Code auf der Rückseite deines Sensors.
                                </FormDescription>
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
                                    <Input placeholder="Passwort Wiederholen" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col items-center gap-4">
                        {error !== "" ? <p className="text-sm text-destructive">{error}</p> : null}
                        <Button className="w-full" disabled={isPending} type="submit">
                            {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Konto erstellen
                        </Button>
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
