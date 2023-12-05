'use client';

import { SortOrder } from "@energyleaf/db/util";
import { SortAsc, SortDesc } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
    children: String;
    sortOrder: SortOrder | null;
    propName: String;
}

export default function DeviceSortButton({ children, sortOrder, propName }: Props) {
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
            <span className="mr-2">{children}</span>
            {
                sortOrder ? (sortOrder === SortOrder.ASC ? (
                    <SortAsc/>
                ) : (
                    <SortDesc/>
                )) : (
                    <div/> // nothing
                )
            }
        </div>
    )
}