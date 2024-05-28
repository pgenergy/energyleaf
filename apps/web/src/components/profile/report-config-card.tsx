"use client";

import IntervalSelector from "@/components/profile/interval-selector";
import TimeSelector from "@/components/profile/time-selector";
import type { reportSettingsSchema } from "@/lib/schema/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateReportConfigSettings } from "@/actions/auth";
import ReportConfigForm from "@/components/profile/report-config-form";
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
    receiveMails: boolean;
    interval: number;
    time: number;
    disabled?: boolean;
}

export default function ReportConfigCard({ receiveMails, interval, time, disabled }: Props) {
    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        track("updateReportConfig()");
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
                    möchten, und das Intervall der Übersichten und die Erstellungszeit Ihrer Berichte festlegen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReportConfigForm reportConfig={reportConfig} disabled={disabled} onSubmit={onSubmit} />
            </CardContent>
        </Card>
    );
}
