"use client";

import {useState, useTransition} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {string, z} from "zod";

import {Form,} from "@energyleaf/ui";
import {updateReportConfigSettings} from "@/actions/profile";
import {reportSettingsSchema} from "@/lib/schema/profile";
import {useSearchParams} from "next/navigation";
import {getUserData, getUserIdByToken} from "@/query/user";

export default function UnsubscribeForm() {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof reportSettingsSchema>>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: {
            receiveMails: true,
            interval: 3,
            time: 6,
        },
    });

    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    let userId: any;

    if (token) {
        userId = getUserIdByToken(token);
    }

    if (!token || !userId) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-xl font-bold">Ungültiges oder abgelaufenes Passwort-Reset-Token</p>
            </div>
        );
    }

    const userData = getUserData(userId);
    //todo die Bereichts-Einstellungen laden und später in der Form anzeigen

    function onSubmit(data: z.infer<typeof reportSettingsSchema>) {
        setError("");
        startTransition(() => {
            toast.promise(updateReportConfigSettings(data), {
                loading: "Bericht-Einstellungen werden aktualisiert...",
                success: "Bericht-Einstellungen erfolgreich aktualisiert",
                error: (err) => {
                    setError((err as unknown as Error).message);
                    return "Fehler beim Anmelden";
                },
            });
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Bericht-Einstellungen aktualisieren</p>
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    {/*todo    */}
                </form>
            </Form>
        </div>
    );
}
