"use client";

import type { reportSettingsSchema } from "@/lib/schema/profile";
import React from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { updateReportConfigSettings } from "@/actions/auth";
import ReportConfigForm from "@/components/profile/report-config-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    receiveMails: boolean;
    interval: number;
    time: number;
    disabled?: boolean;
}

export default function ReportConfigCard({ receiveMails, interval, time, disabled }: Props) {
    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        toast.promise(updateReportConfigSettings(data, null), {
            loading: "Aktualisiere Einstellungen...",
            success: "Einstellungen erfolgreich aktualisiert",
            error: "Ihre Einstellungen konnten nicht aktualisiert werden",
        });
    }

    const reportConfig = {
        receiveMails,
        interval,
        time,
    };

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
                <ReportConfigForm reportConfig={reportConfig} disabled={disabled} onSubmit={onSubmit} />
            </CardContent>
        </Card>
    );
}
