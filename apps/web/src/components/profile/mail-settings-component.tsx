"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import MailSettingsForm from "./mail-settings-form";

interface Props {
    daily: boolean;
    weekly: boolean;
    id: string;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function MailSettingsComponent({ daily, weekly, id }: Props) {
    const [dailyKey, setDailyKey] = useState(daily);
    const [weeklyKey, setWeeklyKey] = useState(weekly);
    const [idKey, setIdKey] = useState(id);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>E-Mail Einstellungen</CardTitle>
                    <CardDescription>
                        Hier kannst du einstellen, ob du täglich oder wöchentlich eine Mail mit deinen aktuellen
                        Verbräuchen erhalten möchtest.
                    </CardDescription>
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
        track(`MailSettingsForm.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setDailyKey(daily);
                setWeeklyKey(weekly);
                setIdKey(id);
            }}
            resetKeys={[dailyKey, weeklyKey, idKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <MailSettingsForm daily={dailyKey} id={idKey} weekly={weeklyKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
