import UsersTable from "@/components/users/table/users-table";
import UsersOverviewDeleteDialog from "@/components/users/users-overview-delete-dialog";
import { UserContextProvider } from "@/hooks/user-hook";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import ErrorCard from "@/components/error/error-card";
import type {FallbackProps} from "react-error-boundary";

export default function UsersOverviewCard() {
    return (
        <UserContextProvider>
            <UsersOverviewDeleteDialog/>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Nutzer</CardTitle>
                    <CardDescription>Hier kannst du alle registrierten Nutzer einsehen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable/>
                </CardContent>
            </Card>
        </UserContextProvider>
    );
}