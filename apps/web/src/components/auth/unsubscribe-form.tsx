"use client";

import { toast } from "sonner";
import type { z } from "zod";

import { updateMailSettings } from "@/actions/auth";
import ReportConfigForm from "@/components/profile/report-config-form";
import type { mailSettingsSchema, reportMailSettingsSchema } from "@/lib/schema/profile";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { useRouter } from "next/navigation";

interface Props {
    reportConfig: z.infer<typeof mailSettingsSchema>;
    userId: string;
}

export default function UnsubscribeForm({ reportConfig, userId }: Props) {
    const router = useRouter();

    async function update(data: z.infer<typeof mailSettingsSchema>) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await updateMailSettings(data, userId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }

        router.push("/unsubscribed");
    }

    function onSubmit(data: z.infer<typeof mailSettingsSchema>) {
        toast.promise(update(data), {
            loading: "Bericht-Einstellungen werden aktualisiert...",
            success: "Bericht-Einstellungen erfolgreich aktualisiert",
            error: (err) => {
                return err.message;
            },
        });
    }

    return <ReportConfigForm onSubmit={onSubmit} initialData={reportConfig} />;
}
