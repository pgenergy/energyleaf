import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@energyleaf/ui";

export default function UserInformationCard() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Informationen</CardTitle>
                <CardDescription>Hier kannst du die Informationen von Nutzer 1 einsehen und ändern.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>TODO</p>
            </CardContent>
        </Card>
    )
}