"use client";

import React, { useTransition } from "react";
import IntervalSelector from "@/components/profile/interval-selector";
import TimeSelector from "@/components/profile/time-selector";
import { reportSettingsSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import {
    Button,
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
    disabled?: boolean;
    onSubmit: (data: z.infer<typeof reportSettingsSchema>) => void;

    reportConfig: z.infer<typeof reportSettingsSchema>;
}

export default function ReportConfigForm({ reportConfig, disabled, onSubmit }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof reportSettingsSchema>>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: reportConfig,
    });

    function onSubmitInternal(data: z.infer<typeof reportSettingsSchema>) {
        if (disabled) return;
        startTransition(() => {
            onSubmit(data);
        });
    }

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmitInternal)}>
                <FormField
                    control={form.control}
                    name="receiveMails"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between gap-2">
                            <div className="flex flex-col gap-2">
                                <FormLabel>Senden der Berichte als E-Mails</FormLabel>
                                <FormDescription>
                                    Erhalten Sie Ihre Berichte mit einer Zusammenfassung Ihres vergangenen Verbrauchs im
                                    eingestellten Intervall per Mail.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch aria-readonly checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="interval"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intervall der Berichte</FormLabel>
                                <FormControl>
                                    <IntervalSelector onChange={field.onChange} value={field.value} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Uhrzeit der Berichte</FormLabel>
                                <FormControl>
                                    <TimeSelector onChange={field.onChange} value={field.value} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-row justify-end">
                    <Button disabled={isPending || disabled} type="submit">
                        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Speichern
                    </Button>
                </div>
            </form>
        </Form>
    );
}
