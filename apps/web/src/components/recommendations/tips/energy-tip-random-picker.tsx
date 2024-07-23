"use client";

import { Button } from "@energyleaf/ui/button";
import { Spinner } from "@energyleaf/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import {} from "react";

export default function EnergyTipRandomPicker() {
    const tips = [
        "Schalten Sie Geräte aus, wenn Sie sie nicht benötigen.",
        "Nutzen Sie energiesparende Geräte.",
        "Vermeiden Sie Standby-Verbrauch.",
    ];

    const queryClient = useQueryClient();
    const queryKey = "energy-tips";
    const {
        data: tip,
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return tips[Math.floor(Math.random() * tips.length)];
        },
    });

    async function onNextClick() {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {isLoading ? (
                <Spinner className="h-16 w-16" />
            ) : (
                <>
                    <LightbulbIcon className="h-16 w-16" />
                    <div>
                        <span className="text-xl italic">{tip}</span>
                    </div>

                    <Button className="gap-2" disabled={isRefetching} onClick={onNextClick}>
                        {isRefetching ? <Spinner className="h-4 w-4" /> : null}
                        Nächster Tipp <ArrowRightIcon />
                    </Button>
                </>
            )}
        </div>
    );
}
