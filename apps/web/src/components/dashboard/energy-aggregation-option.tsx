"use client";

import type { AggregationType } from "@energyleaf/lib";
import { AggregationOption } from "@energyleaf/ui/components/utils";
import { track } from "@vercel/analytics";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface Props {
    selected?: AggregationType;
}

export default function EnergyAggregation({ selected }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onChange = (selectedOption: string) => {
        track("changeAggregationOption()");
        const search = new URLSearchParams();
        searchParams.forEach((value, key) => {
            search.set(key, value);
        });
        search.set("aggregation", selectedOption.toLowerCase());

        router.push(`${pathname}?${search.toString()}`);
        router.refresh();
    };

    return <AggregationOption onSelectedChange={onChange} selected={selected} />;
}
