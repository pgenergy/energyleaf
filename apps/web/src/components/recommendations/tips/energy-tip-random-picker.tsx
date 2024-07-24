"use client";

import { DeviceCategory } from "@energyleaf/db/types";
import { pickRandomEnergyTip } from "@energyleaf/lib";
import { Button } from "@energyleaf/ui/button";
import { Spinner } from "@energyleaf/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, LightbulbIcon } from "lucide-react";
import {} from "react";

export default function EnergyTipRandomPicker() {
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
            return pickRandomEnergyTip([DeviceCategory.ECar]);
        },
    });

    async function onNextClick() {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <LightbulbIcon className="h-16 w-16" />
            {isLoading ? <Spinner className="h-16 w-16" /> : <span className="text-xl italic">{tip?.text}</span>}
            <Button className="gap-2" disabled={isRefetching} onClick={onNextClick}>
                {isRefetching ? <Spinner className="h-4 w-4" /> : null}
                Nächster Tipp <ArrowRightIcon />
            </Button>
        </div>
    );
}
