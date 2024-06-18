import { getUserById, getUserExperimentData } from "@/query/user";
import UserActionsModule from "./user-actions-module";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";

interface Props {
    userId: string;
}

export default async function UserActionsCard({ userId }: Props) {
    const user = await getUserById(userId);
    const experimentData = await getUserExperimentData(userId);

    if (!user) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Nutzer Status</CardTitle>
                <CardDescription>Hier können Sie den Status des Benutzers einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserActionsModule user={user} experimentData={experimentData ?? undefined} />
            </CardContent>
        </Card>
    );
}
