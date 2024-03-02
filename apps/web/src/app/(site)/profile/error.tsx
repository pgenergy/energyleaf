"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

interface Props {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ProfileErrorPage({ reset }: Props) {
    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Es ist ein Fehler aufgetreten</CardTitle>
                    <CardDescription>
                        Beim Laden deiner Daten ist ein Fehler aufgetreten. Bitte versuche es später erneut.
                    </CardDescription>
                    <CardContent className="flex flex-row justify-center px-8 py-4">
                        <Button onClick={() => reset}>Seite neu laden</Button>
                    </CardContent>
                </CardHeader>
            </Card>
        </div>
    );
}
