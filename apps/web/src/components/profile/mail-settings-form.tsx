"use client";

import { updateReportSettingsInformation } from "@/actions/profile";
import MailSettingsFormFields from "@/components/profile/mail-settings-form-fields";
import { reportSettingsSchema } from "@/lib/schema/profile";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Form, Spinner } from "@energyleaf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    disabled?: boolean;
    initialValues: z.infer<typeof reportSettingsSchema>;
}

export default function MailSettingsForm({ initialValues, disabled }: Props) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof reportSettingsSchema>>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: initialValues,
    });

    async function updateMailInformationCallback(data: z.infer<typeof reportSettingsSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateReportSettingsInformation(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        if (disabled) return;
        startTransition(() => {
            toast.promise(updateMailInformationCallback(data), {
                loading: "Aktulisiere Einstellungen...",
                success: "Einstellungen erfolgreich aktualisiert",
                error: (err: Error) => err.message,
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>E-Mail & Berichte</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob Sie die erstellen Berichte über Ihren Verbrauch per E-Mail erhalten
                    möchten, und das Intervall der Übersichten und die Erstellungszeit Ihrer Berichte festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <MailSettingsFormFields form={form} />
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
