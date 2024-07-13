"use client";

import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { Button } from "@energyleaf/ui/button";
import { useState } from "react";
import { EnergyPeakDeviceAssignmentDialog } from "./energy-peak-device-assignment-dialog";

interface Props {
    peak: SensorDataSequenceType;
    userId: string;
}

// TODO: Remove this when peaks are shown in diagram.
export default function PeakButton({ peak, userId }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <EnergyPeakDeviceAssignmentDialog open={open} setOpen={setOpen} value={peak} userId={userId} />
            <Button onClick={() => setOpen(true)}>
                {peak.start.toLocaleTimeString()} - {peak.end.toLocaleTimeString()}
            </Button>
        </>
    );
}
