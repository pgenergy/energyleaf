"use client";

import {useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {reportSettingsSchema} from "@/lib/schema/profile";
import ReportConfigForm from "@/components/profile/report-config-form";
import {updateReportConfigSettings} from "@/actions/auth";
import {Card} from "@energyleaf/ui";
import {useRouter} from "next/navigation";

interface Props {
    reportConfig: z.infer<typeof reportSettingsSchema>;
    userId: string;
}

export default function UnsubscribeForm({reportConfig, userId}: Props) {
    const [error, setError] = useState<string | null>(null)
    const form = useForm<z.infer<typeof reportSettingsSchema>>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: reportConfig,
    });
    const router = useRouter();
    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        setError("");
        toast.promise(updateReportConfigSettings(data, userId), {
            loading: "Bericht-Einstellungen werden aktualisiert...",
            success: "Bericht-Einstellungen erfolgreich aktualisiert",
            error: (err) => {
                setError((err as unknown as Error).message);
                return "Fehler beim Anmelden";
            },
        });
        router.push("/unsubscribed")
    }

    return <ReportConfigForm onSubmit={onSubmit} reportConfig={reportConfig}/>;
}
