import { getDeviceCategoriesByUser, getTipOfTheDay } from "@energyleaf/db/query";
import { getEnergyTip, getRelevantTips } from "@energyleaf/lib/tips";
import { cache } from "react";

export const getEnergyTips = cache(async (userId: string) => {
    const deviceCategories = await getDeviceCategoriesByUser(userId);
    return getRelevantTips(deviceCategories);
});

export const getEnergyTipOfTheDay = cache(async (userId: string) => {
    const tipKey = await getTipOfTheDay(userId);
    return getEnergyTip(tipKey);
});
