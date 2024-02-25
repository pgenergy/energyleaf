"use client";

import { useTransition } from "react";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import type { z } from "zod";

import type { baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { UserBaseInformationForm } from "@energyleaf/ui/components/forms";

interface Props {
    user: {
        id: number;
        username: string;
        email: string;
    };
}

export default function UserInformationCard({ user }: Props) {
    const [changeIsPending, startTransition] = useTransition();

    function onSubmit(data: z.infer<typeof baseInformationSchema>) {
        startTransition(() => {
            toast.promise(updateUser(data, user.id), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: "Fehler beim Aktualisieren",
            });
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Informationen</CardTitle>
                <CardDescription>Hier kannst du die Informationen von Nutzer 1 einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserBaseInformationForm
                    changeIsPending={changeIsPending}
                    email={user.email}
                    mailDisabled={false}
                    onSubmit={onSubmit}
                    username={user.username}
                />
            </CardContent>
        </Card>
    );
}
