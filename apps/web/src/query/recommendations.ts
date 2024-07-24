import { getDeviceCategoriesByUser } from "@energyleaf/db/query";
import { getRelevantTips } from "@energyleaf/lib";
import { cache } from "react";

export const getEnergyTips = cache(async (userId: string) => {
    const deviceCategories = await getDeviceCategoriesByUser(userId);
    return getRelevantTips(deviceCategories);
});
