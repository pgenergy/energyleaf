"use client";

import UserStateForm from "@/components/users/details/user-state-form";
import type { userStateSchema } from "@/lib/schema/user";
import type { UserExperimentDataSelectType, UserSelectType } from "@energyleaf/postgres/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import type { z } from "zod";

interface Props {
    user: UserSelectType;
    experimentData?: UserExperimentDataSelectType;
}

const cardTitle = "Status";

export default function UserActionsModule({ user, experimentData }: Props) {
    const userState: z.infer<typeof userStateSchema> = {
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        isParticipant: user.isParticipant,
        appVersion: user.appVersion,
        experimentStatus: experimentData?.experimentStatus ?? undefined,
        installationDate: experimentData?.installationDate ?? undefined,
        deinstallationDate: experimentData?.deinstallationDate ?? undefined,
        getsPaid: experimentData?.getsPaid ?? false,
        usesProlific: experimentData?.usesProlific ?? false,
        experimentNumber: experimentData?.experimentNumber ?? undefined,
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
        </Card>
    );
}
