"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import AvgEnergyConsumptionCard from "./avg-energy-consumption-card";

interface Props {
    sensorId: string | null;
    avg: number | null;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function AvgEnergyConsumptionComponent({ sensorId, avg }: Props) {
    const [sensorIdKey, setSensorIdKey] = useState(sensorId);
    const [avgKey, setAvgKey] = useState(avg);
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
        track(`AvgEnergyConsumptionCard.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setSensorIdKey(sensorId);
                setAvgKey(avg);
            }}
            resetKeys={[sensorIdKey, avgKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <AvgEnergyConsumptionCard avg={avgKey} sensorId={sensorIdKey} />
            </Suspense>
        </ErrorBoundary>
    );
}
