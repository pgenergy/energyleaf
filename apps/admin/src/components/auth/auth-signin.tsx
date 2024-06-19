"use client";

import { signInAction } from "@/actions/auth";
import { signInSchema } from "@/lib/schema/auth";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@energyleaf/ui/form";
import { Input } from "@energyleaf/ui/input";
import { Spinner } from "@energyleaf/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

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

    async function signInActionCallback(data: z.infer<typeof signInSchema>) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await signInAction(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    const onSubmit = (data: z.infer<typeof signInSchema>) => {
        setError(null);
        startTransition(() => {
            toast.promise(signInActionCallback(data), {
                loading: "Anmelden...",
                success: "Erfolgreich angemeldet",
                error: (err: Error) => {
                    setError(err.message);
                    return err.message;
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
