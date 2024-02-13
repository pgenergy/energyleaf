"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui";

export default function AccountDeletionError({ resetErrorBoundary }: FallbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account löschen</CardTitle>
                <CardDescription>Hier kannst du deinen Account löschen</CardDescription>
            </CardHeader>
            <CardContent>
                <h1>Ein Fehler ist aufgetreten</h1>
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </CardContent>
        </Card>
    );
}
