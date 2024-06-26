import UsersTable from "@/components/users/table/users-table";
import { UserContextProvider } from "@/hooks/user-hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { UserDeleteDialog } from "./user-delete-dialog";

export default function UsersOverviewCard() {
    return (
        <UserContextProvider>
            <UserDeleteDialog />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Nutzer</CardTitle>
                    <CardDescription>Hier können Sie alle registrierten Nutzer einsehen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable />
                </CardContent>
            </Card>
        </UserContextProvider>
    );
}
