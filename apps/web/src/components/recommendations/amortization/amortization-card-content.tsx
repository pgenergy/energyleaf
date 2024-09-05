"use client";

import DevicesBadPowerEstimationAlert from "@/components/devices/devices-bad-power-estimation-alert";
import { evaluatePowerEstimation } from "@/lib/devices/power-estimation";
import { formatNumber, getReferencePowerDataForDeviceCategory } from "@energyleaf/lib";
import type { DeviceCategory } from "@energyleaf/postgres/types";
import { AmortizationChart } from "@energyleaf/ui/charts/amortization-chart";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import type { DeviceItem } from "./amortization-card";
import AmortizationSelect from "./amortization-select";

interface Props {
    devices: DeviceItem[];
    workingPrice: number | null;
    powerEstimationRSquared: number | null;
}

export default function AmortizationCardContent({ devices, workingPrice, powerEstimationRSquared }: Props) {
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

    if (devices.length === 0 || powerEstimationRSquared === null) {
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

    const powerEstimationQuality = evaluatePowerEstimation(powerEstimationRSquared);
    if (powerEstimationQuality === "insufficiently") {
        return (
            <div className="flex w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                Die geschätzten Leistungen der Geräte sind zu ungenau für eine Amortisationsrechnung. Bitte weisen Sie
                weitere Geräte zu Verbrauchsausschlägen zu, um die Amortisationsrechnung nutzen zu können.
            </div>
        );
    }

    const [selected, setSelected] = useState<DeviceItem[]>([]);
    const [
        {
            acquisitionCostInEuros: acquisitionCost,
            weeklyCostsAfterInKWh: weeklyCostsAfter,
            weeklyCostsBeforeInKWh: weeklyCostsBefore,
            savingsInCentPerKWh,
            savingsPerYearInEuros: savingsPerYear,
            amortizationTimeInYears,
        },
        setAmortizationData,
    ] = useState({
        acquisitionCostInEuros: 0,
        weeklyCostsAfterInKWh: 0,
        weeklyCostsBeforeInKWh: 0,
        savingsInCentPerKWh: 0,
        savingsPerYearInEuros: 0,
        amortizationTimeInYears: 0,
    });

    function updateData(newSelected: DeviceItem[]) {
        const {
            totalAcquisitionCostInEuros,
            totalWeeklyConsumptionBeforeInWatt,
            totalWeeklyConsumptionAfterInWatt,
            totalSavedPowerConsumptionInKWh,
        } = newSelected.reduce(
            (acc, device) => {
                const referenceData = getReferencePowerDataForDeviceCategory(device.category as DeviceCategory);
                const referencePower = referenceData.averagePower;
                const referencePurchasePrice = referenceData.purchasePrice;
                const weeklyUsage = device.weeklyUsage ?? 0;
                const power = device.power ?? 0;

                acc.totalAcquisitionCostInEuros += referencePurchasePrice;
                acc.totalWeeklyConsumptionBeforeInWatt += power * weeklyUsage;
                acc.totalWeeklyConsumptionAfterInWatt += referencePower * weeklyUsage;
                if (power !== 0) {
                    acc.totalSavedPowerConsumptionInKWh += 1 - referencePower / power;
                }

                return acc;
            },
            {
                totalAcquisitionCostInEuros: 0,
                totalWeeklyConsumptionBeforeInWatt: 0,
                totalWeeklyConsumptionAfterInWatt: 0,
                totalSavedPowerConsumptionInKWh: 0,
            },
        );

        const weeklyCostsBefore = (totalWeeklyConsumptionBeforeInWatt / 1000) * workingPriceInEuroPerkWh;
        const weeklyCostsAfter = (totalWeeklyConsumptionAfterInWatt / 1000) * workingPriceInEuroPerkWh;
        const savingsPerYearInEuros = 52.14 * (weeklyCostsBefore - weeklyCostsAfter);

        setAmortizationData({
            acquisitionCostInEuros: totalAcquisitionCostInEuros,
            weeklyCostsAfterInKWh: weeklyCostsAfter,
            weeklyCostsBeforeInKWh: weeklyCostsBefore,
            savingsInCentPerKWh: totalSavedPowerConsumptionInKWh * workingPriceInEuroPerkWh * 100,
            savingsPerYearInEuros: savingsPerYearInEuros,
            amortizationTimeInYears: totalAcquisitionCostInEuros / savingsPerYearInEuros,
        });
    }

    function onDeviceWeeklyUsageChange(device: DeviceItem, weeklyUsage: number) {
        device.weeklyUsage = weeklyUsage;
        updateData(selected);
    }

    function onSelectedChange(newSelected: DeviceItem[]) {
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
        <div className="flex flex-col gap-3">
            {powerEstimationQuality === "sufficiently" && <DevicesBadPowerEstimationAlert />}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-1">
                <AmortizationSelect
                    devices={devices}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    onDeviceWeeklyUsageChange={onDeviceWeeklyUsageChange}
                />
                {selected.length > 0 ? (
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <h2 className="text-center font-semibold text-l text-primary">
                                    Eingesparte Cent pro kWh
                                </h2>
                                <p className="text-center">{formatNumber(savingsInCentPerKWh)} ct</p>
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
                        {Number.isFinite(amortizationTimeInYears) ? (
                            <AmortizationChart
                                weeklyCostsAfter={weeklyCostsAfter}
                                initialCostsAfter={acquisitionCost}
                                weeklyCostsBefore={weeklyCostsBefore}
                                amortizationTimeInYears={amortizationTimeInYears}
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground text-sm">
                                Die Amortisation wird nie stattfinden.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-center text-muted-foreground md:col-span-2">
                        Bitte wählen Sie ein Gerät aus, um die Amortisation zu berechnen.
                    </div>
                )}
            </div>
        </div>
    );
}
