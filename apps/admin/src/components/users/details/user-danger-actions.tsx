"use client";

import { useUserContext } from "@/hooks/user-hook";
import type { UserSelectType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    user: UserSelectType;
}

export default function UserDangerActionsCard({ user }: Props) {
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
        <Card className="w-full border border-destructive">
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
