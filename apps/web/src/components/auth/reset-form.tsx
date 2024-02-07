"use client";

import { useState, useTransition } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { resetSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";

export default function ResetForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            passwordRepeat: "",
        },
    });

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    function onSubmit(data: z.infer<typeof resetSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(resetPassword(data, token || ""), {
                loading: "Passwort wird zurückgesetzt...",
                success: "Passwort erfolgreich zurückgesetzt",
                error: (err) => {
                    setError((err as unknown as Error).message);
                    return "Fehler beim Anmelden";
                },
            });

            if (!error) {
                redirect("/"); // login page
            }
        });
    }

    if (!token) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-xl font-bold">Ungültiges oder abgelaufenes Passwort-Reset-Token</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Passwort zurücksetzen</p>

            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <SubmitButton pending={pending} text="Passwort zurücksetzen" />
                </form>
            </Form>
        </div>
    );
}
