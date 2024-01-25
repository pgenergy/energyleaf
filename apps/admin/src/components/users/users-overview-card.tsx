import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UsersTable from "@/components/users/table/users-table";

export default function UsersOverviewCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Nutzer</CardTitle>
                <CardDescription>Hier kannst du alle registrierten Nutzer einsehen.</CardDescription>
            </CardHeader>
            <CardContent>
                <UsersTable/>
            </CardContent>
        </Card>
    )
}