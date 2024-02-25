"use client";

import { useTransition } from "react";
import { updateBaseInformationUsername } from "@/actions/profile";
import { track } from "@vercel/analytics";
import { toast } from "sonner";
import type { z } from "zod";

import type { baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { UserBaseInformationForm } from "@energyleaf/ui/components/forms";

import ChangePasswordForm from "./change-password-form";

interface Props {
    username: string;
    email: string;
    disabled?: boolean;
}

export default function BaseInformationForm({ username, email, disabled }: Props) {
    const [changeIsPending, startTransition] = useTransition();

    function onSubmit(data: z.infer<typeof baseInformationSchema>) {
        if (disabled) {
            return;
        }

        startTransition(() => {
            track("updateBaseInformation()");
            if (data.email !== email) {
                return;
            }
            toast.promise(updateBaseInformationUsername(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Meine Daten</CardTitle>
                <CardDescription>Deine persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <UserBaseInformationForm
                    changeIsPending={changeIsPending}
                    email={email}
                    onSubmit={onSubmit}
                    username={username}
                />
            </CardContent>
            <ChangePasswordForm />
        </Card>
    );
}
