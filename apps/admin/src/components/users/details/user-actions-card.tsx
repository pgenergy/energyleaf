"use client";

import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UserStateForm from "@/components/users/details/user-state-form";
import {useUserDetailsContext} from "@/hooks/user-detail-hook";

interface Props {
    user: {
        isAdmin: boolean;
        isActive: boolean;
        id: number;
        username: string;
    }
}

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
                <CardTitle>Status</CardTitle>
                <CardDescription>Hier kannst du den Status des Benutzers einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserStateForm active={user.isActive} id={user.id} isAdmin={user.isAdmin}/>
            </CardContent>
            <CardHeader>
                <CardTitle>Aktionen</CardTitle>
                <CardDescription>Hier kannst du einige Aktionen zu dem Benutzer ausführen.</CardDescription>
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
    )
}