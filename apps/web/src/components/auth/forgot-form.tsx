"use client";

import { forgotPassword } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { forgotSchema } from "@/lib/schema/auth";
import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { DefaultActionReturn } from "@energyleaf/lib";

export default function ForgotForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            mail: "",
        },
    });

    async function forgotPasswordCallback(data: z.infer<typeof forgotSchema>) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await forgotPassword(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (!res?.success) {
            throw new Error("");
        }
    }

    function onSubmit(data: z.infer<typeof forgotSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(forgotPasswordCallback(data), {
                loading: "E-Mail wird versendet...",
                success: "E-Mail erfolgreich versendet",
                error: (err: Error) => {
                    setError(err.message);
                    return err.message;
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Passwort zurücksetzen</p>
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
                    <div className="flex flex-col items-center gap-4">
                        {error ? <p className="text-destructive text-sm">{error}</p> : null}
                        <SubmitButton pending={pending} text="Zurücksetzen" />
                    </div>
                </form>
            </Form>
        </div>
    );
}
