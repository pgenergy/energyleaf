"use client";

import DeviceCategoryIcon from "@/components/devices/device-category-icon";
import {
    DeviceCategory,
    DeviceCategoryTitles,
    DeviceSuperCategory,
    DeviceSuperCategoryTitles,
} from "@energyleaf/db/types";
import type { EnergyTip } from "@energyleaf/lib/tips";
import { CardDescription } from "@energyleaf/ui/card";
import { useMemo } from "react";

interface Props {
    tip: EnergyTip;
}

export default function EnergyTipCardDescription({ tip }: Props) {
    const content = useMemo(() => {
        const { belongsTo } = tip;
        if (!belongsTo) {
            return "Allgemein";
        }

        function isDeviceCategory(
            value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
        ): value is DeviceCategory {
            return typeof value === "string" && Object.values(DeviceCategory).includes(value as DeviceCategory);
        }

        function isDeviceCategoryArray(
            value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
        ): value is DeviceCategory[] {
            return Array.isArray(value) && value.every(isDeviceCategory);
        }

        function isDeviceSuperCategory(
            value: DeviceCategory | DeviceCategory[] | DeviceSuperCategory,
        ): value is DeviceSuperCategory {
            return (
                typeof value === "string" && Object.values(DeviceSuperCategory).includes(value as DeviceSuperCategory)
            );
        }

        if (isDeviceCategory(belongsTo)) {
            return (
                <span className="flex flex-row items-center gap-1">
                    {`Für Geräte-Kategorie ${DeviceCategoryTitles[belongsTo]}`}
                    <DeviceCategoryIcon category={belongsTo} />
                </span>
            );
        }

        if (isDeviceCategoryArray(belongsTo)) {
            return `Für Geräte-Kategorien ${belongsTo.map((category) => DeviceCategoryTitles[category]).join(", ")}`;
        }

        if (isDeviceSuperCategory(belongsTo)) {
            return `Für Geräte-Oberkategorie ${DeviceSuperCategoryTitles[belongsTo]}`;
        }

        return null;
    }, [tip]);

    return <CardDescription>{content}</CardDescription>;
}
