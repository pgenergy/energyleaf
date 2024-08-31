"use client";

import { EnergyPeakDeviceAssignmentForm } from "@/components/dashboard/peaks/energy-peak-device-assignment-form";
import { formatNumber } from "@energyleaf/lib";
import type { SensorDataSequenceSelectType } from "@energyleaf/postgres/types";
import { Badge } from "@energyleaf/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@energyleaf/ui/dialog";
import { MousePointerClickIcon } from "lucide-react";
import React from "react";

interface Props {
    value: SensorDataSequenceSelectType;
    userId: string;
}

export function PeakAssignmentDialog(props: Props) {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
                <Badge className="cursor-pointer">
                    <MousePointerClickIcon className="mr-2 h-3 w-3" />
                    Zuweisen
                </Badge>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>
                        Wählen Sie die Geräte aus, die diesen Verbrauch verursacht haben.
                    </DialogDescription>
                </DialogHeader>
                <p>Leistung: {formatNumber(props.value.averagePeakPower)} Watt</p>
                <EnergyPeakDeviceAssignmentForm
                    userId={props.userId}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorDataSequenceId={props.value.id}
                />
            </DialogContent>
        </Dialog>
    );
}
