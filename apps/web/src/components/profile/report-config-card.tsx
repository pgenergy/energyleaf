"use client";

import type { mailSettingsSchema } from "@/lib/schema/profile";
import { track } from "@vercel/analytics";
import React from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { updateMailSettings } from "@/actions/auth";
import ReportConfigForm from "@/components/profile/report-config-form";
import type { MailConfig } from "@energyleaf/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    initialData: z.infer<typeof mailSettingsSchema>;
    disabled?: boolean;
}

export default function ReportConfigCard({ initialData, disabled }: Props) {
    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        track("updateReportConfig()");
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
                    Hier können Sie einstellen, ob Sie die erstellen Berichte über Ihren Verbrauch per E-Mail erhalten
                    möchten, und das Intervall sowie die Erstellungszeit Ihrer Berichte festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReportConfigForm initialData={initialData} disabled={disabled} onSubmit={onSubmit} />
            </CardContent>
        </Card>
    );
}
