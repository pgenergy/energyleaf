"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import ChangePasswordForm from "./change-password-form";

interface Props {
    id: string;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function ChangePasswordComponent({ id }: Props) {
    const [idKey, setIdKey] = useState(id);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Passwort</CardTitle>
                    <CardDescription>Ändere dein Passwort</CardDescription>
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
        track(`ChangePasswordForm.${error.name}("${error.message}")`);
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
                <ChangePasswordForm id={idKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
