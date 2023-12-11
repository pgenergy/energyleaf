"use client";

import { useState } from "react";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { loginSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

export default function LoginForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            mail: "",
            password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        setLoading(true);
        await signInAction(data.mail, data.password);
        setLoading(false);
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
                        <Button className="w-full" disabled={loading} type="submit">
                            {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Anmelden
                        </Button>
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
        </div>
    );
}
