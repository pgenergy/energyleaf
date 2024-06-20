"use client";

import type { mailSettingsSchema } from "@/lib/schema/profile";
import React from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { updateMailSettings } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import MailConfigForm from "./mail-config-form";

interface Props {
    initialData: z.infer<typeof mailSettingsSchema>;
    disabled?: boolean;
}

export default function MailConfigCard({ initialData, disabled }: Props) {
    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        toast.promise(updateMailSettings(data, null), {
            loading: "Aktualisiere Einstellungen...",
            success: "Einstellungen erfolgreich aktualisiert",
            error: "Ihre Einstellungen konnten nicht aktualisiert werden",
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>E-Mail & Berichte</CardTitle>
                <CardDescription>
                    Hier können Sie einstellen, ob Sie die Informationen über Ihren Verbrauch per E-Mail erhalten
                    möchten, und das Intervall sowie die Erstellungszeit Ihrer Berichte festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MailConfigForm initialData={initialData} disabled={disabled} onSubmit={onSubmit} />
            </CardContent>
        </Card>
    );
}
