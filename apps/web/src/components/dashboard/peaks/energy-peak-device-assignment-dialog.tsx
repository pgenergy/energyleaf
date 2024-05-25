import type { peakSchema } from "@/lib/schema/peak";
import type { Peak } from "@/types/consumption/peak";
import type { DeviceSelectType } from "@energyleaf/db/types";
import type { ConsumptionData } from "@energyleaf/lib";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";
import type { z } from "zod";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: ConsumptionData;
    userId: string;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, userId }: Props) {
    const initialValues: z.infer<typeof peakSchema> = {
        device: [],
    };

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>
                        Wählen Sie ein Gerät aus, das diesen Verbrauch verursacht hat.
                    </DialogDescription>
                </DialogHeader>
                <p>Verbrauch: {value.energy}</p>
                <EnergyPeakDeviceAssignmentForm
                    userId={userId}
                    initialValues={initialValues}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorId={value.sensorId.toString()}
                    timestamp={value.timestamp}
                />
            </DialogContent>
        </Dialog>
    );
}
