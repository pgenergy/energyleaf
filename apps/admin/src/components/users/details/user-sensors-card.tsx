import UserSensorsTable from "@/components/users/details/user-sensors-table";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";
import ErrorCard from "@/components/error/error-card";
import type {FallbackProps} from "react-error-boundary";

interface Props {
    userId: number;
}

export default function UserSensorsCard({ userId }: Props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Sensoren</CardTitle>
                <CardDescription>Hier kannst du die Sensoren des Nutzers einsehen.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserSensorsTable userId={userId} />
            </CardContent>
        </Card>
    );
}
