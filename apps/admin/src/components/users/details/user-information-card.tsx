"use client";

import { updateUser } from "@/actions/user";
import type { UserSelectType } from "@energyleaf/db/types";
import type { baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import { UserBaseInformationForm } from "@energyleaf/ui/components/forms";
import { useTransition } from "react";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    user: UserSelectType;
}

const cardTitle = "Informationen";

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
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>
                    Hier können Sie die Informationen von Nutzer {user.firstname} {user.lastName} | {user.username}{" "}
                    einsehen und ändern mit ID: {user.id}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UserBaseInformationForm
                    firstname={user.firstname}
                    lastname={user.lastName}
                    changeIsPending={changeIsPending}
                    email={user.email}
                    phone={user.phone ?? undefined}
                    address={user.address}
                    onSubmit={onSubmit}
                    username={user.username}
                />
            </CardContent>
        </Card>
    );
}
