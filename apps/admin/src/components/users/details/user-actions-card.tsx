"use client";

import UserStateForm from "@/components/users/details/user-state-form";
import type { userStateSchema } from "@/lib/schema/user";
import type { UserSelectType } from "@energyleaf/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import type { z } from "zod";

interface Props {
    user: UserSelectType;
}

export default function UserActionsCard({ user }: Props) {
    const userState: z.infer<typeof userStateSchema> = {
        isAdmin: user.isAdmin,
        active: user.isActive,
        isParticipant: user.isParticipant,
        appVersion: user.appVersion,
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Hier können Sie den Status des Benutzers einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserStateForm id={user.id} initialValues={userState} />
            </CardContent>
        </Card>
    );
}
