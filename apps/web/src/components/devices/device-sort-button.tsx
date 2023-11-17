'use client';

import { SortOrder } from "@energyleaf/db/util";
import { ArrowDown, ArrowUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
    sortOrder: SortOrder | null;
    propName: String;
}

export default function DeviceSortButton({ sortOrder, propName }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function onClick(prevSortOrder: SortOrder | null, pathname: string) {
        if (!sortOrder) {
            prevSortOrder = SortOrder.DESC;
        }

        const search = new URLSearchParams({
            sortOrder: prevSortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
            sortProp: propName.toString()
        });
        router.push(`${pathname}?${search.toString()}`);
    }

    return (
        <div className="flex items-center cursor-pointer" onClick={() => onClick(sortOrder, pathname)}>
            <span className="mr-2">Test</span>
            {
                sortOrder ? (sortOrder === SortOrder.ASC ? (
                    <ArrowDown/>
                ) : (
                    <ArrowUp/>
                )) : (
                    <div/> // nothing
                )
            }
        </div>
    )
}