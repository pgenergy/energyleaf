import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UserStateForm from "@/components/users/user-state-form";

interface Props {
    user: {
        isAdmin: boolean;
        active: boolean;
        id: number;
    }
}

export default function UserActionsCard({ user }: Props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Aktionen</CardTitle>
                <CardDescription>Hier kannst du einige Aktionen für den Benutzer ausführen.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserStateForm active={user.active} id={user.id} isAdmin={user.isAdmin} />
            </CardContent>
        </Card>
    )
}