"use client";

import { clientTracking } from "@/actions/tracking";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const track = async () => {
            // Track pageviews
            if (pathname) {
                let url = window.origin + pathname;
                if (searchParams.toString()) {
                    url = `${url}?${searchParams.toString()}`;
                }

                await clientTracking({
                    path: pathname,
                    search: searchParams.toString(),
                    url: url,
                });
            }
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
