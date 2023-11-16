'use client';

import { SortOrder } from "@energyleaf/db/util";
import { Button } from "@energyleaf/ui";
import { usePathname, useRouter } from "next/navigation";

interface Props {
    sortOrder: SortOrder;
}

export default function DeviceSortButton({ sortOrder }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    function onClick(prevSortOrder: SortOrder, pathname: String) {
        const search = new URLSearchParams({
            sortOrder: prevSortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
        });
        router.push(`${pathname}?${search.toString()}`);
    }

    return (
        <Button onClick={() => onClick(sortOrder, pathname)}>Test</Button>
    )
}