"use client";

import UserStateForm from "@/components/users/details/user-state-form";
import { useUserContext } from "@/hooks/user-hook";
import type { userStateSchema } from "@/lib/schema/user";
import type { UserExperimentDataSelectType, UserSelectType } from "@energyleaf/db/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import type { z } from "zod";

interface Props {
    user: UserSelectType;
    experimentData?: UserExperimentDataSelectType;
}

const cardTitle = "Status";

export default function UserActionsModule({ user, experimentData }: Props) {
    const userDetailsContext = useUserContext();

    function resetPassword() {
        userDetailsContext.setPasswordResetDialogOpen(true);
        userDetailsContext.setUser(user);
    }

    function openDeleteDialog() {
        userDetailsContext.setDeleteDialogOpen(true);
        userDetailsContext.setUser(user);
    }

    const userState: z.infer<typeof userStateSchema> = {
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        isParticipant: user.isParticipant,
        appVersion: user.appVersion,
        experimentStatus: experimentData?.experimentStatus ?? undefined,
        installationDate: experimentData?.installationDate ?? undefined,
        deinstallationDate: experimentData?.deinstallationDate ?? undefined,
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>Hier können Sie den Status des Benutzers einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserStateForm id={user.id} initialValues={userState} />
            </CardContent>
            <CardHeader>
                <CardTitle>Aktionen</CardTitle>
                <CardDescription>Hier können Sie einige Aktionen zu dem Benutzer ausführen.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-row items-center justify-evenly">
                    <Button className="mb-2" onClick={resetPassword} variant="destructive">
                        Passwort zurücksetzen
                    </Button>
                    <Button onClick={openDeleteDialog} variant="destructive">
                        Account löschen
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
