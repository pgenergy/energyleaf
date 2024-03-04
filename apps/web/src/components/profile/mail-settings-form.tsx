"use client";

import React, { useTransition } from "react";
import { updateMailInformation } from "@/actions/profile";
import { mailSettingsSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    Spinner,
    Switch,
} from "@energyleaf/ui";

interface Props {
    daily: boolean;
    weekly: boolean;
    disabled?: boolean;
}

export default function MailSettingsForm({ daily, weekly, disabled }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: {
            daily,
            weekly,
        },
    });

    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        if (disabled) return;
        startTransition(() => {
            track("updateMailSettings()");
            toast.promise(updateMailInformation(data), {
                loading: "Aktulisiere Einstellungen...",
                success: "Einstellungen erfolgreich aktualisiert",
                error: "Ihre Einstellungen konnten nicht aktualisiert werden",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>E-Mail Einstellungen</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob Sie täglich oder wöchentlich eine Mail mit Ihren aktuellen
                    Verbräuchen erhalten möchten.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="daily"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>Tägliche E-Mails</FormLabel>
                                        <FormDescription>
                                            Erhalten Sie täglich eine E-Mail mit Ihren aktuellen Verbräuchen.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            aria-readonly
                                            checked={field.value}
                                            disabled={disabled}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weekly"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded border border-border p-4">
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>Wöchentliche E-Mails</FormLabel>
                                        <FormDescription>
                                            Erhalten Sie wöchentlich eine E-Mail mit Ihren aktuellen Verbräuchen.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            aria-readonly
                                            checked={field.value}
                                            disabled={disabled}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row justify-end">
                            <Button disabled={isPending || disabled} type="submit">
                                {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
