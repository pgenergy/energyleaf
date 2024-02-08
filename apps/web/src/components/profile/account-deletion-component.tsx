"use client";

import React, { Suspense, useState } from "react";
import AccountDeletionForm from "@/components/profile/account-deletion-form";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

interface Props {
    id: string;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function AccountDeletionComponent({ id }: Props) {
    const [idKey, setIdKey] = useState(id);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Account löschen</CardTitle>
                    <CardDescription>Hier kannst du deinen Account löschen</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row gap-2">
                        <AlertTriangleIcon />
                        <p>Ein Fehler ist aufgetreten{error.message ? `: "${error.message}"` : ""}</p>
                    </div>
                    <br />
                    <Button onClick={resetErrorBoundary} type="button" variant="ghost">
                        <RotateCwIcon className="mr-2 h-4 w-4" />
                        Erneut versuchen
                    </Button>
                </CardContent>
            </Card>
        );
    }
    const logError = (error: Error) => {
        track(`AccountDeletionForm.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setIdKey(id);
            }}
            resetKeys={[idKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <AccountDeletionForm id={idKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
