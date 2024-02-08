"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import EnergyConsumptionStatisticCard from "./energy-consumption-statistics";

interface Props {
    startDate: Date;
    endDate: Date;
    sensorId: string | null;
    energyData: {
        id: number;
        timestamp: Date | null;
        value: number;
        sensorId: string | null;
    }[];
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function EnergyConsumptionStatisticsComponent({ startDate, endDate, sensorId, energyData }: Props) {
    const [startDateKey, setStartDateKey] = useState(startDate);
    const [endDateKey, setEndDateKey] = useState(endDate);
    const [sensorIdKey, setSensorIdKey] = useState(sensorId);
    const [energyDataKey, setEnergyDataKey] = useState(energyData);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Verbrauchsstatistiken</CardTitle>
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
        track(`EnergyConsumptionStatisticsCard.${error.name}("${error.message}")`);
    };

    return (
        <ErrorBoundary
            FallbackComponent={errorFallback}
            onError={logError}
            onReset={() => {
                setStartDateKey(startDate);
                setEndDateKey(endDate);
                setSensorIdKey(sensorId);
                setEnergyDataKey(energyData);
            }}
            resetKeys={[startDateKey, endDateKey, sensorIdKey, energyDataKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <EnergyConsumptionStatisticCard
                    endDate={endDateKey}
                    energyData={energyDataKey}
                    sensorId={sensorIdKey}
                    startDate={startDateKey}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
