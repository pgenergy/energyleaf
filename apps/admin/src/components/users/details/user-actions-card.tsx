"use client";

import ErrorCard from "@/components/error/error-card";
import UserStateForm from "@/components/users/details/user-state-form";
import { useUserContext } from "@/hooks/user-hook";
import type { FallbackProps } from "react-error-boundary";

import type { UserSelectType } from "@energyleaf/db/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    user: UserSelectType;
}

const cardTitle = "Status";

export default function UserActionsCard({ user }: Props) {
    const userDetailsContext = useUserContext();

    function resetPassword() {
        userDetailsContext.setPasswordResetDialogOpen(true);
        userDetailsContext.setUser(user);
    }

    function openDeleteDialog() {
        userDetailsContext.setDeleteDialogOpen(true);
        userDetailsContext.setUser(user);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>Hier können Sie den Status des Benutzers einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserStateForm active={user.isActive} id={user.id} isAdmin={user.isAdmin} />
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

export function UserActionsCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard resetErrorBoundary={resetErrorBoundary} title={cardTitle} />;
}
