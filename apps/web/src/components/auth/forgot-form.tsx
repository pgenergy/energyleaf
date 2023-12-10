"use client";

import { useState, useTransition } from "react";
import { forgotPassword } from "@/actions/auth";
import { forgotSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, Form, FormControl, FormDescription, FormField, FormItem, FormMessage, Input } from "@energyleaf/ui";
import { useToast } from "@energyleaf/ui/hooks";

export default function ForgotForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            mail: "",
        },
    });

    async function onSubmit(data: z.infer<typeof forgotSchema>) {
        setLoading(true);
        await forgotPassword(data);
        setLoading(false);
        toast({
            title: "Email wurde verschickt",
            description: "",
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
                        <Button className="w-full" disabled={loading} type="submit">
                            {loading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Zurücksetzen
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
