"use client";

import { DeviceCategory, type DeviceSelectType } from "@energyleaf/db/types";
import { formatNumber, getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@energyleaf/ui/card";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { useState } from "react";
import AmortizationSelect from "./amortization-select";

interface Props {
    workingPrice: number;
}

export interface DeviceItem {
    category: DeviceCategory;
    id: number;
    name: string;
    powerEstimation: number;
    weeklyUsageEstimation: number;
    weeklyUsage: number;
}

export default function AmortizationCard({ workingPrice }: Props) {
    const devices: DeviceItem[] = [
        {
            category: DeviceCategory.AirConditioning,
            id: 1,
            name: "Klimaanlage",
            powerEstimation: 2500,
            weeklyUsageEstimation: 4.34,
            weeklyUsage: 4.34,
        },
        {
            category: DeviceCategory.ECar,
            id: 2,
            name: "E-Auto Ladestation",
            powerEstimation: 9000,
            weeklyUsageEstimation: 20,
            weeklyUsage: 20,
        },
        {
            category: DeviceCategory.HairDryer,
            id: 3,
            name: "Haartrockner",
            powerEstimation: 2000,
            weeklyUsageEstimation: 1,
            weeklyUsage: 1,
        },
    ];
    const [selected, setSelected] = useState<DeviceItem[]>([]);
    const [acquisitionCost, setAcquisitionCost] = useState<number>(0);
    const [weeklyCostsAfter, setWeeklyCostsAfter] = useState<number>(0);
    const [weeklyCostsBefore, setWeeklyCostsBefore] = useState<number>(0);
    const [savingsPerKWh, setSavingsPerKWh] = useState<number>(0);
    const [savingsPerYear, setSavingsPerYear] = useState<number>(0);
    const [amortizationTimeInYears, setAmortisationTimeInYears] = useState<number>(0);

    function updateData(newSelected: DeviceItem[]) {
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
            (acc, device) => acc + (device.powerEstimation ?? 0) * (device.weeklyUsage ?? 0),
            0,
        );
        const weeklyCostsSelectedBefore = (weeklyConsumptionSelectedBefore / 1000) * workingPrice;
        setWeeklyCostsBefore(weeklyCostsSelectedBefore);

        const weeklyConsumptionSelectedAfter = referenceValuesOfSelected.reduce(
            (acc, device) => acc + (device.referencePower ?? 0) * (device.weeklyUsage ?? 0),
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
    }

    function onDeviceWeeklyUsageChange(device: DeviceItem, weeklyUsage: number) {
        const newSelected = selected.map((d) => {
            if (d.id === device.id) {
                return {
                    ...d,
                    weeklyUsage,
                };
            }
            return d;
        });
        updateData(newSelected);
    }

    function test(newSelected: DeviceItem[]) {
        updateData(newSelected);
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
                <AmortizationSelect
                    devices={devices}
                    selected={selected}
                    onSelectedChange={test}
                    onDeviceWeeklyUsageChange={onDeviceWeeklyUsageChange}
                />
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
