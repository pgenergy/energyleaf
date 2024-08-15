"use client";
import { DeviceCategoryTitles, DeviceSuperCategoryTitles } from "@energyleaf/db/types";
import { type EnergyTip, isDeviceCategory, isDeviceCategoryArray, isDeviceSuperCategory } from "@energyleaf/lib/tips";
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

        if (isDeviceCategory(belongsTo)) {
            return `Für Geräte-Kategorie ${DeviceCategoryTitles[belongsTo]}`;
        }

        if (isDeviceCategoryArray(belongsTo)) {
            return `Für Geräte-Kategorien ${belongsTo.map((category) => DeviceCategoryTitles[category]).join(", ")}`;
        }

        if (isDeviceSuperCategory(belongsTo)) {
            return `Für Geräte-Oberkategorie ${DeviceSuperCategoryTitles[belongsTo]}`;
        }

        return null;
    }, [tip]);

    return content;
}
