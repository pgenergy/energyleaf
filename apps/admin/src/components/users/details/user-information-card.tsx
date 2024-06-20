"use client";

import { updateUser } from "@/actions/user";
import type { UserSelectType } from "@energyleaf/db/types";
import type { DefaultActionReturn, baseInformationSchema } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { UserBaseInformationForm } from "@energyleaf/ui/forms/user-base-information-form";
import { useTransition } from "react";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    user: UserSelectType;
}

const cardTitle = "Informationen";

export default function UserInformationCard({ user }: Props) {
    const [changeIsPending, startTransition] = useTransition();

    async function updateUserCallback(data: z.infer<typeof baseInformationSchema>, userId: string) {
        let res: DefaultActionReturn = undefined;
        try {
            res = await updateUser(data, userId);
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSubmit(data: z.infer<typeof baseInformationSchema>) {
        startTransition(() => {
            toast.promise(updateUserCallback(data, user.id), {
                loading: "Speichere...",
                success: "Erfolgreich aktualisiert",
                error: (err: Error) => err.message,
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
