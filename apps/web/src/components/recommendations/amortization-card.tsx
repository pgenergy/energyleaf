"use client";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import AmortizationSelect from "./amortization-select";
import {useEffect, useState} from "react";
import {getReferencePowerDataForDeviceCategory} from "@energyleaf/lib";

interface Props {
    workingPrice: number;
}

export default function AmortizationCard({ workingPrice }: Props) {
    const devices: DeviceSelectType[] = [
        {
            category: DeviceCategory.AirConditioning,
            id: 1,
            name: "Klimaanlage",
            created: new Date(),
            powerEstimation: 2500,
            timestamp: new Date(),
            userId: "1",
            weeklyUsageEstimation: 400,
        },
        {
            category: DeviceCategory.ECar,
            id: 2,
            name: "E-Auto Ladestation",
            created: new Date(),
            powerEstimation: 9000,
            timestamp: new Date(),
            userId: "1",
            weeklyUsageEstimation: 40,
        },
        {
            category: DeviceCategory.HairDryer,
            id: 3,
            name: "Haartrockner",
            created: new Date(),
            powerEstimation: 2000,
            timestamp: new Date(),
            weeklyUsageEstimation: 3450,
            userId: "1",
        },
    ];
    const [selected, setSelected] = useState<DeviceSelectType[]>([]);
    const [acquisitionCost, setAcquisitionCost] = useState<number>(0);
    const [weeklyCostsAfter, setWeeklyCostsAfter] = useState<number>(0);
    const [weeklyCostsBefore, setWeeklyCostsBefore] = useState<number>(0);
    

    function updateSelected(newSelected: DeviceSelectType[]) {
        const referenceValuesOfSelected =  newSelected.map((device) => {
            const referenceData = getReferencePowerDataForDeviceCategory(device.category as DeviceCategory);
            return {
            ...device,
            referencePower: referenceData.averagePower,
            referencePurchasePrice: referenceData.purchasePrice
        }});
        setAcquisitionCost((referenceValuesOfSelected.reduce((acc, device) => acc + device.referencePurchasePrice, 0)));

        const weeklyConsumptionSelectedBefore = newSelected.reduce((acc, device) => acc + (device.powerEstimation ?? 0) * (device.weeklyUsageEstimation ?? 0), 0);
        setWeeklyCostsBefore((weeklyConsumptionSelectedBefore / 1000) * workingPrice);

       const weeklyConsumptionSelectedAfter = referenceValuesOfSelected.reduce((acc, device) => acc + (device.referencePower ?? 0) * (device.weeklyUsageEstimation ?? 0), 0);
        setWeeklyCostsAfter((weeklyConsumptionSelectedAfter / 1000) * workingPrice);

        setSelected(newSelected)

        console.log(acquisitionCost, weeklyCostsAfter, weeklyCostsBefore)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Geräte-Amortisation</CardTitle>
                <CardDescription>
                    Hier können Sie prüfen, nach welcher Zeit sich die Anschaffung eines neuen Gerätes rentiert hat.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-3 md:grid-rows-1">
                <AmortizationSelect devices={devices} selected={selected} onSelectedChange={updateSelected} />
                <div className="flex flex-col gap-4 md:col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Cent pro kWh</h2>
                            <p className="text-center">2 ct</p>
                        </div>
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Euro pro Jahr</h2>
                            <p className="text-center">3 €</p>
                        </div>
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Amortisationszeit</h2>
                            <p className="text-center">2 Jahre</p>
                        </div>
                    </div>
                    <AmortizationChart weeklyCostsAfter={weeklyCostsAfter} initialCostsAfter={acquisitionCost} weeklyCostsBefore={weeklyCostsBefore} />
                </div>
            </CardContent>
        </Card>
    );
}
