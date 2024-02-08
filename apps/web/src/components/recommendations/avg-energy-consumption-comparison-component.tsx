"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import AvgEnergyConsumptionComparisonCard from "./avg-energy-consumption-comparison";

interface Props {
    sensorId: string | null;
    avg: {
        avg: number;
        count: number;
    } | null;
    avgUser: number | null;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function AvgEnergyConsumptionComparisonComponent({ sensorId, avg, avgUser }: Props) {
    const [sensorIdKey, setSensorIdKey] = useState(sensorId);
    const [avgKey, setAvgKey] = useState(avg);
    const [avgUserKey, setAvgUserKey] = useState(avgUser);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Durchschnittlicher Energieverbrauch</CardTitle>
                    <CardDescription>Dein durchschnittlicher Energieverbrauch</CardDescription>
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
        track(`AvgEnergyConsumptionComparisonCard.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setSensorIdKey(sensorId);
                setAvgKey(avg);
                setAvgUserKey(avgUser);
            }}
            resetKeys={[sensorIdKey, avgKey, avgUserKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <AvgEnergyConsumptionComparisonCard avg={avgKey} avgUser={avgUserKey} sensorId={sensorIdKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
