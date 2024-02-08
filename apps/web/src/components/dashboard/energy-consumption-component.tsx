"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import type { AggregationType } from "@energyleaf/db/util";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import EnergyConsumptionCard from "./energy-consumption-card";

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
    aggregation: AggregationType;
    devices: {
        id: number;
        userId: number;
        name: string;
        created: Date | null;
        timestamp: Date;
    }[];
    peaksWithDevicesAssigned: ({
        id: string;
        device: number;
    } | null)[];
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function EnergyConsumptionComponent({
    startDate,
    endDate,
    sensorId,
    energyData,
    aggregation,
    devices,
    peaksWithDevicesAssigned,
}: Props) {
    const [startDateKey, setStartDateKey] = useState(startDate);
    const [endDateKey, setEndDateKey] = useState(endDate);
    const [sensorIdKey, setSensorIdKey] = useState(sensorId);
    const [energyDataKey, setEnergyDataKey] = useState(energyData);
    const [aggregationKey, setAggregationKey] = useState(aggregation);
    const [devicesKey, setDevicesKey] = useState(devices);
    const [peaksWithDevicesAssignedKey, setPeaksWithDevicesAssignedKey] = useState(peaksWithDevicesAssigned);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Verbrauch</CardTitle>
                    <CardDescription>Übersicht deines Verbrauchs im Zeitraum</CardDescription>
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
        track(`EnergyConsumptionCard.${error.name}("${error.message}")`);
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
                setAggregationKey(aggregation);
                setDevicesKey(devices);
                setPeaksWithDevicesAssignedKey(peaksWithDevicesAssigned);
            }}
            resetKeys={[
                startDateKey,
                endDateKey,
                sensorIdKey,
                energyDataKey,
                aggregationKey,
                devicesKey,
                peaksWithDevicesAssignedKey,
            ]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <EnergyConsumptionCard
                    aggregation={aggregationKey}
                    devices={devicesKey}
                    endDate={endDateKey}
                    energyData={energyDataKey}
                    peaksWithDevicesAssigned={peaksWithDevicesAssignedKey}
                    sensorId={sensorIdKey}
                    startDate={startDateKey}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
