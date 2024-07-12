"use client";

import { updateDevicesForPeak } from "@/actions/peak";
import { Button } from "@energyleaf/ui/button";

interface Props {
    peakId: string;
    start: Date;
    end: Date;
}

// TODO: Remove this when peaks are shown in diagram.
export default function PeakButton({ peakId, start, end }: Props) {
    return (
        <Button
            onClick={async () => {
                await updateDevicesForPeak({ device: [{ id: 2, name: "idc" }] }, peakId);
            }}
        >
            {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
        </Button>
    );
}
