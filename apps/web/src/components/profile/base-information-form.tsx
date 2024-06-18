"use client";

import { updateBaseInformationUsername } from "@/actions/profile";
import type { DefaultActionReturn, baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { UserBaseInformationForm } from "@energyleaf/ui/forms/user-base-information-form";
import { useTransition } from "react";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    phone?: string;
    address: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    disabled?: boolean;
}

export default function BaseInformationForm({ username, email, firstname, lastname, phone, address, disabled }: Props) {
    const [changeIsPending, startTransition] = useTransition();

    async function updateBaseInformationUsernameCallback(data: z.infer<typeof baseInformationSchema>) {
        let res: DefaultActionReturn = undefined;

        try {
            res = await updateBaseInformationUsername(data);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof baseInformationSchema>) {
        if (disabled) {
            return;
        }

        startTransition(() => {
            if (data.email !== email) {
                return;
            }
            toast.promise(updateBaseInformationUsernameCallback(data), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: (err: Error) => err.message,
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Meine Daten</CardTitle>
                <CardDescription>Ihre persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent>
                <UserBaseInformationForm
                    changeIsPending={changeIsPending}
                    disabled={disabled}
                    email={email}
                    address={address}
                    phone={phone}
                    firstname={firstname}
                    lastname={lastname}
                    onSubmit={onSubmit}
                    username={username}
                />
            </CardContent>
        </Card>
    );
}
