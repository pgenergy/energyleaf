"use client";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber, getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { useCallback, useEffect, useState } from "react";
import AmortizationSelect from "./amortization-select";

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
            weeklyUsageEstimation: 4.34,
        },
        {
            category: DeviceCategory.ECar,
            id: 2,
            name: "E-Auto Ladestation",
            created: new Date(),
            powerEstimation: 9000,
            timestamp: new Date(),
            userId: "1",
            weeklyUsageEstimation: 20,
        },
        {
            category: DeviceCategory.HairDryer,
            id: 3,
            name: "Haartrockner",
            created: new Date(),
            powerEstimation: 2000,
            timestamp: new Date(),
            weeklyUsageEstimation: 1,
            userId: "1",
        },
    ];
    const [selected, setSelected] = useState<DeviceSelectType[]>([]);
    const [acquisitionCost, setAcquisitionCost] = useState<number>(0);
    const [weeklyCostsAfter, setWeeklyCostsAfter] = useState<number>(0);
    const [weeklyCostsBefore, setWeeklyCostsBefore] = useState<number>(0);
    const [savingsPerKWh, setSavingsPerKWh] = useState<number>(0);
    const [savingsPerYear, setSavingsPerYear] = useState<number>(0);
    const [amortizationTimeInYears, setAmortisationTimeInYears] = useState<number>(0);

    function updateSelected(newSelected: DeviceSelectType[]) {
        const referenceValuesOfSelected = newSelected.map((device) => {
            const referenceData = getReferencePowerDataForDeviceCategory(device.category as DeviceCategory);
            return {
                ...device,
                referencePower: referenceData.averagePower,
                referencePurchasePrice: referenceData.purchasePrice,
            };
        });
        const newAcquisitionCost = referenceValuesOfSelected.reduce(
            (acc, device) => acc + device.referencePurchasePrice,
            0,
        );
        setAcquisitionCost(newAcquisitionCost);

        const weeklyConsumptionSelectedBefore = newSelected.reduce(
            (acc, device) => acc + (device.powerEstimation ?? 0) * (device.weeklyUsageEstimation ?? 0),
            0,
        );
        const weeklyCostsSelectedBefore = (weeklyConsumptionSelectedBefore / 1000) * workingPrice;
        setWeeklyCostsBefore(weeklyCostsSelectedBefore);

        const weeklyConsumptionSelectedAfter = referenceValuesOfSelected.reduce(
            (acc, device) => acc + (device.referencePower ?? 0) * (device.weeklyUsageEstimation ?? 0),
            0,
        );
        const weeklyCostsSelectedAfter = (weeklyConsumptionSelectedAfter / 1000) * workingPrice;
        setWeeklyCostsAfter(weeklyCostsSelectedAfter);

        const savedPowerConsumption = referenceValuesOfSelected.reduce(
            (acc, device) => acc + (1 - device.referencePower / (device.powerEstimation ?? 0)),
            0,
        );
        setSavingsPerKWh(savedPowerConsumption * workingPrice * 100);

        const savingsPerYearSelected = 52.14 * (weeklyCostsSelectedBefore - weeklyCostsSelectedAfter);
        setSavingsPerYear(savingsPerYearSelected);

        setAmortisationTimeInYears(newAcquisitionCost / savingsPerYearSelected);
        setSelected(newSelected);
    }

    const formatAmortisationTime = (test: number) => {
        if (test >= 1) {
            return `${formatNumber(test)} Jahre`;
        }

        return `${formatNumber(test * 12)} Monate`;
    };

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
                {selected.length > 0 ? (
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h2 className="text-center font-semibold text-l text-primary">
                                    Eingesparte Cent pro kWh
                                </h2>
                                <p className="text-center">{formatNumber(savingsPerKWh)} ct</p>
                            </div>
                            <div>
                                <h2 className="text-center font-semibold text-l text-primary">
                                    Eingesparte Euro pro Jahr
                                </h2>
                                <p className="text-center">{formatNumber(savingsPerYear)} €</p>
                            </div>
                            <div>
                                <h2 className="text-center font-semibold text-l text-primary">Amortisationszeit</h2>
                                <p className="text-center">{formatAmortisationTime(amortizationTimeInYears)}</p>
                            </div>
                        </div>
                        <AmortizationChart
                            weeklyCostsAfter={weeklyCostsAfter}
                            initialCostsAfter={acquisitionCost}
                            weeklyCostsBefore={weeklyCostsBefore}
                            amortizationTimeInYears={amortizationTimeInYears}
                        />
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-center text-muted-foreground md:col-span-2">
                        Bitte wählen Sie ein Gerät aus, um die Amortisation zu berechnen.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
