"use client";

import { getConsumptionBySensor, getElectricitySensorByUser } from "@/actions/sensors";
import { useUserContext } from "@/hooks/user-hook";
import type { SensorDataSelectType } from "@energyleaf/db/types";
import { AggregationType } from "@energyleaf/lib";
import { EnergyConsumptionChart } from "@energyleaf/ui/charts/energy-consumption-chart";
import { useEffect, useState } from "react";

interface Props {
    userId: string;
}

export default function UserConsumptionCardContent({ userId }: Props) {
    const data = useConsumptionData(userId);
    const context = useUserContext();

    function handleZoom(start: Date, end: Date) {
        context.setStartDate(start);
        context.setEndDate(end);
        context.setZoomed(true);
    }

    return (
        <div className="w-full">
            {data.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
                </div>
            ) : (
                <EnergyConsumptionChart
                    aggregation={context.aggregationType}
                    data={data}
                    zoomCallback={handleZoom}
                    showPeaks={false}
                />
            )}
        </div>
    );
}

function useConsumptionData(userId: string) {
    const context = useUserContext();
    const [data, setData] = useState<SensorDataSelectType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const sensorId = await getElectricitySensorByUser(userId);
            if (!sensorId) {
                return;
            }

            const energyData = await getConsumptionBySensor(
                sensorId,
                context.startDate,
                context.endDate,
                context.aggregationType || AggregationType.RAW,
            );

            return energyData;
        };

        fetchData()
            .then(
                (x) => {
                    setData(x || []);
                },
                () => {
                    setData([]);
                },
            )
            .catch(() => {
                setData([]);
            });
    }, [userId, context.startDate, context.endDate, context.aggregationType]);

    return data;
}
