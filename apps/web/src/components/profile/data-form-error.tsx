"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function UserDataError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Benutzerdaten</CardTitle>
                <CardDescription>Ändere deine Benutzerdaten</CardDescription>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
