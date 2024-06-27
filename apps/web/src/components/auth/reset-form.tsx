"use client";

import { resetPassword } from "@/actions/auth";
import SubmitButton from "@/components/auth/submit-button";
import { resetSchema } from "@/lib/schema/auth";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Form, FormControl, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

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

    async function resetPasswordCallback(data: z.infer<typeof resetSchema>, token: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await resetPassword(data, token);
        } catch (err) {
            throw new Error("Fehler beim Zurücksetzen des Passworts.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof resetSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(resetPasswordCallback(data, token || ""), {
                loading: "Passwort wird zurückgesetzt...",
                success: "Passwort erfolgreich zurückgesetzt",
                error: (err: Error) => {
                    setError(err.message);
                    return err.message;
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
                <p className="font-bold text-xl">Ungültiges oder abgelaufenes Passwort-Reset-Token</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Passwort zurücksetzen</p>

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
                    {error ? <p className="text-destructive text-sm">{error}</p> : null}
                    <SubmitButton pending={pending} text="Passwort zurücksetzen" />
                </form>
            </Form>
        </div>
    );
}
