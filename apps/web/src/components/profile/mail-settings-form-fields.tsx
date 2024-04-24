import IntervalSelector from "@/components/profile/interval-selector";
import TimeSelector from "@/components/profile/time-selector";
import type { mailSettingsSchema } from "@/lib/schema/profile";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, Switch } from "@energyleaf/ui";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
    form: UseFormReturn<z.infer<typeof reportSettingsSchema>>;
}

export default function MailSettingsFormFields({ form }: Props) {
    return (
        <>
            <FormField
                control={form.control}
                name="receiveMails"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
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
        </>
    );
}
