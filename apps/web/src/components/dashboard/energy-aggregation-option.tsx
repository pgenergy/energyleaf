import React, { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { track } from '@vercel/analytics';

import { AggregationOption, calculateAggregationOptions } from '@energyleaf/ui/components/utils';

export default function EnergyAggregation({ selected }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const availableOptions = useMemo(() => {
        const startDateStr = searchParams.get('start');
        const endDateStr = searchParams.get('end');
        return calculateAggregationOptions(startDateStr, endDateStr);
    }, [searchParams]);

    const onChange = (selectedOption) => {
        track('changeAggregationOption');
        const search = new URLSearchParams();
        searchParams.forEach((value, key) => {
            search.set(key, value);
        });
        search.set('aggregation', selectedOption.toLowerCase());

        router.push(`${pathname}?${search.toString()}`);
        router.refresh();
    };

    return (
        <AggregationOption
            availableOptions={availableOptions}
            onSelectedChange={onChange}
            selected={selected}
        />
    );
}
