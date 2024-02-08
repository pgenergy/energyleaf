"use client";

import React, { Suspense, useState } from "react";
import BaseInformationForm from "@/components/profile/base-information-form";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

interface Props {
    username: string;
    email: string;
    id: string;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function BaseInformationComponent({ username, email, id }: Props) {
    const [usernameKey, setUsernameKey] = useState(username);
    const [emailKey, setEmailKey] = useState(email);
    const [idKey, setIdKey] = useState(id);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Meine Daten</CardTitle>
                    <CardDescription>Deine persönlichen Daten</CardDescription>
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
        track(`BaseInformationForm.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setUsernameKey(username);
                setEmailKey(email);
                setIdKey(id);
            }}
            resetKeys={[usernameKey, emailKey, idKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <BaseInformationForm email={emailKey} id={idKey} username={usernameKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
