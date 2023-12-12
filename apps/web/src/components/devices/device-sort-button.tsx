"use client";

import { usePathname, useRouter } from "next/navigation";
import { SortAsc, SortDesc } from "lucide-react";

import { SortOrder } from "@energyleaf/db/util";

interface Props {
    children: string;
    sortOrder: SortOrder | null;
    propName: string;
}

export default function DeviceSortButton({ children, sortOrder, propName }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function onClick() {
        if (!sortOrder) {
            const search = new URLSearchParams({
                sortOrder: SortOrder.ASC,
                sortProp: propName.toString(),
            });
            router.push(`${pathname}?${search.toString()}`);
        } else {
            const search = new URLSearchParams({
                sortOrder: sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
                sortProp: propName.toString(),
            });
            router.push(`${pathname}?${search.toString()}`);
        }
    }

    if (sortOrder) {
        return (
            <button
                className="flex cursor-pointer items-center"
                onClick={onClick}
                type="button"
            >
                <span className="mr-2">{children}</span>
                {sortOrder === SortOrder.ASC ? (
                    <SortAsc />
                ) : (
                    <SortDesc />
                )}
            </button>
        );
    }

    return (
        <button
            className="flex cursor-pointer items-center"
            onClick={onClick}
            type="button"
        >
            <span className="mr-2">{children}</span>
        </button>
    );
}
