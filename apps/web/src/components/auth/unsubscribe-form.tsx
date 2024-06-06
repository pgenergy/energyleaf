"use client";

import { toast } from "sonner";
import type { z } from "zod";

import { updateReportConfigSettings } from "@/actions/auth";
import ReportConfigForm from "@/components/profile/report-config-form";
import { useRouter } from "next/navigation";
import type {reportSettingsSchema} from "@/lib/schema/profile";

interface Props {
    reportConfig: z.infer<typeof reportSettingsSchema>;
    userId: string;
}

export default function UnsubscribeForm({ reportConfig, userId }: Props) {
    const router = useRouter();
    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        toast.promise(updateReportConfigSettings(data, userId), {
            loading: "Bericht-Einstellungen werden aktualisiert...",
            success: "Bericht-Einstellungen erfolgreich aktualisiert",
            error: (err) => {
                return "Fehler beim Anmelden";
            },
        });
        router.push("/unsubscribed");
    }

    return <ReportConfigForm onSubmit={onSubmit} reportConfig={reportConfig} />;
}
