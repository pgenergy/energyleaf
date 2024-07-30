import { getSession } from "@/lib/auth/auth.server";
import { getEnergyTips } from "@/query/recommendations";
import {} from "@energyleaf/ui/card";
import {} from "lucide-react";
import EnergyTipsCardContent from "./energy-tips-card-content";

export default async function EnergyTipsCard() {
    const { user } = await getSession();
    if (!user) {
        return null;
    }

    const energyTips = await getEnergyTips(user.id);
    const shuffledTips = energyTips.sort(() => Math.random() - 0.5);

    return <EnergyTipsCardContent tips={shuffledTips} />;
}
