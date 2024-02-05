"use client";

import { useState, useTransition } from "react";
import { forgotPassword } from "@/actions/auth";
import { forgotSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";
import SubmitButton from "@/components/auth/submit-button";

export default function ForgotForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            mail: "",
        },
    });

    function onSubmit(data: z.infer<typeof forgotSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(forgotPassword(data), {
                loading: "E-Mail wird versendet...",
                success: "E-Mail erfolgreich versendet",
                error: (err) => {
                    setError((err as unknown as Error).message);
                    return "Fehler beim Anmelden";
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Passwort zurücksetzen</p>
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
                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        <SubmitButton pending={pending} text={"Zurücksetzen"} />
                    </div>
                </form>
            </Form>
        </div>
    );
}
