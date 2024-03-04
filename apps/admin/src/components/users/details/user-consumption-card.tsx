import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";
import UserConsumptionCardContent from "@/components/users/details/user-consumption-card-content";

interface Props {
    userId: number;
}

export default function UserConsumptionCard({ userId }: Props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Verbrauch</CardTitle>
                <CardDescription>Hier kannst du den Verbrauch des Nutzers einsehen.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserConsumptionCardContent userId={userId} />
            </CardContent>
        </Card>
    );
}