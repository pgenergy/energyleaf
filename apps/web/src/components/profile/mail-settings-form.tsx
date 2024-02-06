"use client";

import React, {useTransition} from "react";
import {updateMailInformation} from "@/actions/profile";
import {mailSettingsSchema} from "@/lib/schema/profile";
import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2Icon} from "lucide-react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import type {z} from "zod";
import TimeSelector from "@/components/profile/time-selector";

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
    FormLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Switch,
} from "@energyleaf/ui";
import DaySelector from "@/components/profile/day-selector";

interface Props {
    daily: boolean;
    dailyTime: number;
    weekly: boolean;
    weeklyTime: number;
    weeklyDay: number;
    id: string;
}

export default function MailSettingsForm({daily, dailyTime, weekly, weeklyTime, weeklyDay, id}: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: {
            daily,
            dailyTime,
            weekly,
            weeklyTime,
            weeklyDay
        },
    });

    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        startTransition(() => {
            toast.promise(updateMailInformation(data, id), {
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
                    Hier können Sie einstellen, ob Sie tägliche Übersichten sowie wöchentliche Zusammenfassungen Ihres
                    Verbrauchs per Mail erhalten möchten.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="rounded-lg border border-border p-4">
                            <FormField
                                control={form.control}
                                name="daily"
                                render={({field}) => (
                                    <FormItem className="flex gap-4 flex-row items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            <FormLabel>Tägliche E-Mails</FormLabel>
                                            <FormDescription>
                                                Erhalte Sie täglich eine E-Mail mit einer Übersicht Ihrer aktuellen
                                                Verbräuche.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch aria-readonly checked={field.value}
                                                    onCheckedChange={field.onChange}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="w-full pt-4">
                                <FormField
                                    control={form.control}
                                    name="dailyTime"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Uhrzeit für tägliche E-Mails</FormLabel>
                                            <FormControl>
                                                <TimeSelector field={field}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                            <FormField
                                control={form.control}
                                name="weekly"
                                render={({field}) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            <FormLabel>Wöchentliche E-Mails</FormLabel>
                                            <FormDescription>
                                                Erhalten Sie wöchentlich eine E-Mail mit einer Zusammenfassung Ihres
                                                vergangenen Verbrauchs.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch aria-readonly checked={field.value}
                                                    onCheckedChange={field.onChange}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="weeklyDay"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Wochentag für wöchentliche Zusammenfassungen</FormLabel>
                                            <FormControl>
                                                <DaySelector field={field}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weeklyTime"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Uhrzeit für wöchentliche Zusammenfassungen</FormLabel>
                                            <FormControl>
                                                <TimeSelector field={field}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row justify-end">
                            <Button disabled={isPending} type="submit">
                                {isPending ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Speichern
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
