"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function ChangePasswordError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Passwort</CardTitle>
                <CardDescription>Ändere dein Passwort</CardDescription>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
