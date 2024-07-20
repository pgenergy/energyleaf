"use client";

import type { DeviceCategory } from "@energyleaf/db/types";
import { formatNumber, getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { DeviceItem } from "./amortization-card";
import AmortizationSelect from "./amortization-select";

interface Props {
    devices: DeviceItem[];
    workingPrice: number | null;
}

export default function AmortizationCardContent({ devices, workingPrice }: Props) {
    if (!workingPrice) {
        return (
            <div className="items-center">
                <Link
                    href="/settings"
                    className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                >
                    Strompreis in den Einstellungen festlegen <ArrowRightIcon className="h-4 w-4" />
                </Link>
            </div>
        );
    }
    const workingPriceInEuroPerkWh = workingPrice ?? 0;

    if (devices.length === 0) {
        return (
            <div className="flex w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                Keines Ihrer Geräte ist schlechter als ein Vergleichsgerät.
                <Link
                    href="/devices"
                    className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                >
                    Zur Geräte-Seite <ArrowRightIcon className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    const [selected, setSelected] = useState<DeviceItem[]>([]);
    const [acquisitionCost, setAcquisitionCost] = useState<number>(0);
    const [weeklyCostsAfter, setWeeklyCostsAfter] = useState<number>(0);
    const [weeklyCostsBefore, setWeeklyCostsBefore] = useState<number>(0);
    const [savingsPerKWh, setSavingsPerKWh] = useState<number>(0);
    const [savingsPerYear, setSavingsPerYear] = useState<number>(0);
    const [amortizationTimeInYears, setAmortisationTimeInYears] = useState<number>(0);

    function updateData(newSelected: DeviceItem[]) {
        const {
            totalAcquisitionCost,
            totalWeeklyConsumptionBefore,
            totalWeeklyConsumptionAfter,
            totalSavedPowerConsumption,
        } = newSelected.reduce(
            (acc, device) => {
                const referenceData = getReferencePowerDataForDeviceCategory(device.category as DeviceCategory);
                const referencePower = referenceData.averagePower;
                const referencePurchasePrice = referenceData.purchasePrice;
                const weeklyUsage = device.weeklyUsage ?? 0;
                const powerEstimation = device.powerEstimation ?? 0;

                acc.totalAcquisitionCost += referencePurchasePrice;
                acc.totalWeeklyConsumptionBefore += powerEstimation * weeklyUsage;
                acc.totalWeeklyConsumptionAfter += referencePower * weeklyUsage;
                if (powerEstimation !== 0) {
                    acc.totalSavedPowerConsumption += 1 - referencePower / powerEstimation;
                }

                return acc;
            },
            {
                totalAcquisitionCost: 0,
                totalWeeklyConsumptionBefore: 0,
                totalWeeklyConsumptionAfter: 0,
                totalSavedPowerConsumption: 0,
            },
        );

        const weeklyCostsBefore = (totalWeeklyConsumptionBefore / 1000) * workingPriceInEuroPerkWh;
        const weeklyCostsAfter = (totalWeeklyConsumptionAfter / 1000) * workingPriceInEuroPerkWh;
        const savingsPerYear = 52.14 * (weeklyCostsBefore - weeklyCostsAfter);

        setAcquisitionCost(totalAcquisitionCost);
        setWeeklyCostsBefore(weeklyCostsBefore);
        setWeeklyCostsAfter(weeklyCostsAfter);
        setSavingsPerKWh(totalSavedPowerConsumption * workingPriceInEuroPerkWh * 100);
        setSavingsPerYear(savingsPerYear);
        setAmortisationTimeInYears(totalAcquisitionCost / savingsPerYear);
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-1">
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
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Cent pro kWh</h2>
                            <p className="text-center">{formatNumber(savingsPerKWh)} ct</p>
                        </div>
                        <div>
                            <h2 className="text-center font-semibold text-l text-primary">Eingesparte Euro pro Jahr</h2>
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
        </div>
    );
}
