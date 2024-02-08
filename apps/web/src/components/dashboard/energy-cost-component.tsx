"use client";

import React, { Suspense, useState } from "react";
import { track } from "@vercel/analytics";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@energyleaf/ui";

import EnergyCostCard from "./energy-cost-card";

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
    userData: {
        user_data: {
            id: number;
            userId: number;
            timestamp: Date;
            property: "house" | "apartment" | null;
            budget: number | null;
            basePrice: number | null;
            workingPrice: number | null;
            tariff: "basic" | "eco" | null;
            limitEnergy: number | null;
            household: number | null;
            livingSpace: number | null;
            hotWater: "electric" | "not_electric" | null;
            monthlyPayment: number | null;
        };
        mail: {
            id: number;
            userId: number;
            mailDaily: boolean;
            mailWeekly: boolean;
        };
    } | null;
}

interface FallbackProps {
    error: Error & { digest?: string };
    resetErrorBoundary: () => void;
}

export default function EnergyCostComponent({ startDate, endDate, sensorId, energyData, userData }: Props) {
    const [startDateKey, setStartDateKey] = useState(startDate);
    const [endDateKey, setEndDateKey] = useState(endDate);
    const [sensorIdKey, setSensorIdKey] = useState(sensorId);
    const [energyDataKey, setEnergyDataKey] = useState(energyData);
    const [userDataKey, setUserDataKey] = useState(userData);
    function errorFallback({ error, resetErrorBoundary }: FallbackProps) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Energiekosten</CardTitle>
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
        track(`EnergyCostCard.${error.name}("${error.message}")`);
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
                setUserDataKey(userData);
            }}
            resetKeys={[startDateKey, endDateKey, sensorIdKey, energyDataKey, userDataKey]}
        >
            <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <EnergyCostCard
                    endDate={endDateKey}
                    energyData={energyDataKey}
                    sensorId={sensorIdKey}
                    startDate={startDateKey}
                    userData={userDataKey}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
