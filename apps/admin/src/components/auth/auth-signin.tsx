"use client";

import { useState, useTransition } from "react";
import signInAction from "@/actions/auth";
import { signInSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@energyleaf/ui";

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
        startTransition(async () => {
            setError(null);
            const res = await signInAction(data);
            if (res) {
                setError(res.message);
            }
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
                    {pending ? <Loader2Icon className="2-4 h-4 animate-spin" /> : null}
                    Anmelden
                </Button>
            </form>
        </Form>
    );
}
