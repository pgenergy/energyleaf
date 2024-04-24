"use client";

import { signInAction } from "@/actions/auth";
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Spinner } from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {signInSchema} from "@/lib/schema/auth";

export default function AuthForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: z.infer<typeof signInSchema>) => {
        setError(null);
        startTransition(() => {
            toast.promise(signInAction(data), {
                loading: "Anmelden...",
                success: "Erfolgreich angemeldet",
                error: (err) => {
                    const errMessage = err as unknown as Error;
                    setError(errMessage.message);
                    return errMessage.message;
                },
            });
        });
    };

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" />
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
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error ? <p className="text-destructive">{error}</p> : null}
                <Button className="flex flex-row gap-2" disabled={pending} type="submit">
                    {pending ? <Spinner className="2-4 h-4" /> : null}
                    Anmelden
                </Button>
            </form>
        </Form>
    );
}
