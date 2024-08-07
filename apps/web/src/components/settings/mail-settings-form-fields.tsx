import IntervalSelector from "@/components/settings/interval-selector";
import TimeSelector from "@/components/settings/time-selector";
import type { mailSettingsSchema } from "@/lib/schema/profile";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@energyleaf/ui/form";
import { Switch } from "@energyleaf/ui/switch";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface Props {
    form: UseFormReturn<z.infer<typeof mailSettingsSchema>>;
    disabled?: boolean;
}

export default function MailSettingsFormFields({ form, disabled }: Props) {
    return (
        <>
            <h4 className="font-semibold text-xl">Berichte</h4>
            <FormField
                control={form.control}
                name="receiveReportMails"
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
                            <Switch
                                aria-readonly
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={disabled}
                            />
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
                                <IntervalSelector onChange={field.onChange} value={field.value} disabled={disabled} />
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
                                <TimeSelector onChange={field.onChange} value={field.value} disabled={disabled} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            <h4 className="pt-3 font-semibold text-xl">Ungewöhnliche Verbräuche</h4>
            <FormField
                control={form.control}
                name="receiveAnomalyMails"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <FormLabel>
                                Senden von Benachrichtigungen über ungewöhnliche Verbräuche als E-Mails
                            </FormLabel>
                            <FormDescription>
                                Erhalten Sie E-Mails, wenn ungewöhnliche Verbräuche festgestellt werden.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                aria-readonly
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={disabled}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
        </>
    );
}
