"use client";

import { useTransition } from "react";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import type { z } from "zod";

import type { UserSelectType } from "@energyleaf/db/types";
import type { baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { UserBaseInformationForm } from "@energyleaf/ui/components/forms";

interface Props {
    user: UserSelectType;
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
                <CardDescription>
                    Hier kannst du die Informationen von Nutzer {user.id} einsehen und ändern.
                </CardDescription>
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
