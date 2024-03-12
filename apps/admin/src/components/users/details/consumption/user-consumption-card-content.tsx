"use client";

import {EnergyConsumptionChart, type EnergyData} from "@energyleaf/ui/components/charts";
import {useUserDetailsContext} from "@/hooks/user-detail-hook";
import {useEffect, useState} from "react";
import {getConsumptionBySensor, getElectricitySensorByUser} from "@/actions/sensors";

interface Props {
    userId: string;
}

export default function UserConsumptionCardContent({ userId }: Props) {
    const data = useConsumptionData(userId);
    return <div className="h-96 w-full">
        {data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
                <p className="text-muted-foreground">In diesem Zeitraum stehen keine Daten zur Verfügung</p>
            </div>
        )
        : <EnergyConsumptionChart data={data}/>}
    </div>;
}

function useConsumptionData(userId: string) {
    const context = useUserDetailsContext();
    const [data, setData] = useState<EnergyData[]>([]);

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
                context.aggregationType
            );
            return energyData.map((entry) => ({
                sensorId: entry.sensorId || 0,
                energy: entry.value,
                timestamp: entry.timestamp.toString(),
            }));
        };

        fetchData()
            .catch(() => [])
            .then(
                (x) => { setData(x || [] ) },
                () => { setData([]) }
            );
    }, [userId, context.startDate, context.endDate, context.aggregationType]);

    return data;
}