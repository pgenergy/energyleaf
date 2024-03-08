"use client";

import UserStateForm from "@/components/users/details/user-state-form";
import { useUserDetailsContext } from "@/hooks/user-detail-hook";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import ErrorCard from "@/components/error/error-card";
import type {FallbackProps} from "react-error-boundary";

interface Props {
    user: {
        isAdmin: boolean;
        isActive: boolean;
        id: number;
        username: string;
    };
}

const cardTitle = "Status";

export default function UserActionsCard({ user }: Props) {
    const userDetailsContext = useUserDetailsContext();

    function resetPassword() {
        userDetailsContext.setResetPasswordDialogOpen(true);
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
                <div className="inline-flex flex-col">
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