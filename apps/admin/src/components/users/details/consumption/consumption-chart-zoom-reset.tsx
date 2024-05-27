import { useUserContext } from "@/hooks/user-hook";
import { Button } from "@energyleaf/ui";
import type { MouseEvent } from "react";

export default function ConsumptionChartZoomReset() {
    const context = useUserContext();

    if (!context.zoomed) {
        return null;
    }

    function handleResetZoom(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const startDate = context.startDate;
        const endDate = context.endDate;

        context.setStartDate(new Date(startDate.setHours(0, 0, 0, 0)));
        context.setEndDate(new Date(endDate.setHours(23, 59, 59, 999)));
        context.setZoomed(false);
    }

    return (
        <Button variant="outline" onClick={handleResetZoom}>
            Zoom zurücksetzen
        </Button>
    );
}
