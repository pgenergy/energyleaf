"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";
import { LineChart } from "@energyleaf/ui/components";

import EnergyConsumptionTooltip from "./energy-consumption-tooltip";

interface Props {
    data: Record<string, string | number | undefined>[];
    peaks: Record<string, string | number | undefined>[];
}

export default function EnergyConsumptionCardChart({ data, peaks }: Props) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<Record<string, string | number | undefined>>({});

    return (
        <>
            <Dialog onOpenChange={setOpen} open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Geräteauswahl</DialogTitle>
                        <DialogDescription>Wähle ein Gerät aus, was diesen Verbrauch verursacht hat.</DialogDescription>
                    </DialogHeader>
                    <h1 className="p-8 text-center">TODO</h1>
                    <p>Verbrauch: {value.energy}</p>
                </DialogContent>
            </Dialog>
            <LineChart
                data={data}
                keyName="energy"
                referencePoints={{
                    data: peaks,
                    xKeyName: "timestamp",
                    yKeyName: "energy",
                    callback: (callbackData) => {
                        setValue(callbackData);
                        setOpen(true);
                    },
                }}
                tooltip={{
                    content: EnergyConsumptionTooltip,
                }}
                xAxes={{ dataKey: "timestamp" }}
                yAxes={{ dataKey: "energy", name: "Energieverbauch in Wh" }}
            />
        </>
    );
}
