"use client";

import React, { Suspense, useState } from "react";
import type { userDataSchema } from "@/lib/schema/profile";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import type { z } from "zod";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import UserDataForm from "./data-form";

interface Props {
    initialData: z.infer<typeof userDataSchema>;
    id: string;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function UserDataComponent({ initialData, id }: Props) {
    const [initialDataKey, setInitialDataKey] = useState(initialData);
    const [idKey, setIdKey] = useState(id);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Benutzerdaten</CardTitle>
                    <CardDescription>Ändere deine Benutzerdaten</CardDescription>
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
        track(`UserDataForm.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setInitialDataKey(initialData);
                setIdKey(id);
            }}
            resetKeys={[initialDataKey, idKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <UserDataForm id={idKey} initialData={initialDataKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
