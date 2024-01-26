import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";

export default function UserActionsCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Aktionen</CardTitle>
                <CardDescription>Hier kannst du einige Aktionen für den Benutzer ausführen.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>TODO</p>
            </CardContent>
        </Card>
    )
}