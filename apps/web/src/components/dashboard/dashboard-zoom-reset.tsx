"use client";

import { Button } from "@energyleaf/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";

export default function DashboardZoomReset() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const isZoomed = searchParams.has("zoomed") && searchParams.get("zoomed") === "true";

    if (!isZoomed) {
        return null;
    }

    function handleResetZoom(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const search = new URLSearchParams();
        searchParams.forEach((v, key) => {
            if (key === "start") {
                const date = new Date(v);
                date.setHours(0, 0, 0, 0);
                search.set(key, date.toISOString());
            } else if (key === "end") {
                const date = new Date(v);
                date.setHours(23, 59, 59, 999);
                search.set(key, date.toISOString());
            } else {
                search.set(key, v);
            }
            search.delete("zoomed");
        });
        router.push(`${pathname}?${search.toString()}`, {
            scroll: false,
        });
    }

    return (
        <Button variant="outline" onClick={handleResetZoom}>
            Zoom zurücksetzen
        </Button>
    );
}
