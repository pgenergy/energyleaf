import { Suspense } from "react";
import { redirect } from "next/navigation";
import AbsolutEnergyConsumptionComponent from "@/components/dashboard/absolut-energy-consumption-component";
import EnergyConsumptionComponent from "@/components/dashboard/energy-consumption-component";
import EnergyConsumptionStatisticsComponent from "@/components/dashboard/energy-consumption-statistics-component";
import EnergyCostComponent from "@/components/dashboard/energy-cost-component";
import { getSession } from "@/lib/auth/auth";
import { getDevicesByUser } from "@/query/device";
import { getElectricitySensorIdForUser, getEnergyDataForSensor, getPeaksBySensor } from "@/query/energy";
import { getUserData } from "@/query/user";

import { AggregationType } from "@energyleaf/db/util";
import { Skeleton } from "@energyleaf/ui";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { start?: string; end?: string; aggregation?: string };
}) {
    const startDateString = searchParams.start;
    const endDateString = searchParams.end;
    const aggregationType = searchParams.aggregation;
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = endDateString ? new Date(endDateString) : new Date();

    if (!startDateString) {
        startDate.setUTCHours(0, 0, 0, 0);
    }

    if (!endDateString) {
        endDate.setUTCHours(23, 59, 59, 999);
    }

    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const userId = session.user.id;
    const sensorId = await getElectricitySensorIdForUser(userId);
    let energyData: {
        id: number;
        timestamp: Date | null;
        value: number;
        sensorId: string | null;
    }[] = [];
    let userData: {
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
    } | null = null;
    let aggregation: AggregationType = AggregationType.RAW;
    let devices: {
        id: number;
        userId: number;
        name: string;
        created: Date | null;
        timestamp: Date;
    }[] = [];
    let peaksWithDevicesAssigned: ({
        id: string;
        device: number;
    } | null)[] = [];

    if (sensorId) {
        energyData = await getEnergyDataForSensor(startDate, endDate, sensorId);
        if (aggregationType) {
            aggregation = AggregationType[aggregationType.toUpperCase() as keyof typeof AggregationType];
            energyData = await getEnergyDataForSensor(startDate, endDate, sensorId, aggregation);
            devices = await getDevicesByUser(userId);
        }
        userData = await getUserData(session.user.id);
        peaksWithDevicesAssigned = (await getPeaksBySensor(startDate, endDate, sensorId))
            .map((x) => {
                if (x.sensor_data !== null) {
                    return {
                        id: x.sensor_data.sensorId,
                        device: x.peaks.deviceId,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <AbsolutEnergyConsumptionComponent
                        endDate={endDate}
                        energyData={energyData}
                        sensorId={sensorId}
                        startDate={startDate}
                    />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyConsumptionStatisticsComponent
                        endDate={endDate}
                        energyData={energyData}
                        sensorId={sensorId}
                        startDate={startDate}
                    />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <EnergyCostComponent
                        endDate={endDate}
                        energyData={energyData}
                        sensorId={sensorId}
                        startDate={startDate}
                        userData={userData}
                    />
                </Suspense>
            </div>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                <EnergyConsumptionComponent
                    aggregation={aggregation}
                    devices={devices}
                    endDate={endDate}
                    energyData={energyData}
                    peaksWithDevicesAssigned={peaksWithDevicesAssigned}
                    sensorId={sensorId}
                    startDate={startDate}
                />
            </Suspense>
        </div>
    );
}
