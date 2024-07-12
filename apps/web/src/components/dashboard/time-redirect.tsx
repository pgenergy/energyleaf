"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TimeRedirect() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date();
            endDate.setUTCHours(23, 59, 59, 999);
            const search = new URLSearchParams();
            searchParams.forEach((v, key) => {
                search.set(key, v);
            });
            search.set("start", startDate.toISOString());
            search.set("end", endDate.toISOString());
            router.push(`${pathname}?${search.toString()}`, {
                scroll: false,
            });
        }
    }, [searchParams, router, pathname]);

    return null;
}
