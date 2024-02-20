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
import IntervalSelector from "@/components/profile/interval-selector";

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
    Switch,
} from "@energyleaf/ui";

interface Props {
    id: string;
    receiveMails: boolean;
    reportInterval: number;
    reportTime: number;
}

export default function MailSettingsForm({id, receiveMails, reportInterval, reportTime}: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: {
            receiveMails,
            reportInterval,
            reportTime
        },
    });

    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        startTransition(() => {
            toast.promise(updateMailInformation(data, id), {
                loading: "Aktualisiere Einstellungen...",
                success: "Einstellungen erfolgreich aktualisiert",
                error: "Ihre Einstellungen konnten nicht aktualisiert werden",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>E-Mail & Berichte</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob Sie die erstellen Berichte über Ihren Verbrauch per E-Mail erhalten
                    möchten,
                    und das Intervall der Übersichten und die Erstellungszeit Ihrer Berichte festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="receiveMails"
                            render={({field}) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <div className="flex flex-col gap-2">
                                        <FormLabel>Senden der Berichte als E-Mails</FormLabel>
                                        <FormDescription>
                                            Erhalten Sie Ihre Berichte mit einer Zusammenfassung Ihres
                                            vergangenen Verbrauchs im eingestellten Intervall per Mail.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch aria-readonly checked={field.value}
                                                onCheckedChange={field.onChange}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reportInterval"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Intervall der Berichte</FormLabel>
                                        <FormControl>
                                            <IntervalSelector field={field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reportTime"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Uhrzeit der Berichte</FormLabel>
                                        <FormControl>
                                            <TimeSelector field={field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
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
