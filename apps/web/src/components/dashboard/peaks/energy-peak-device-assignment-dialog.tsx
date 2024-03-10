import type { Peak } from "@/types/peaks/peak";

import type { DeviceSelectType } from "@energyleaf/db/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";

import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: Peak;
    devices: DeviceSelectType[];
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, devices }: Props) {
    const initialValues = {
        deviceId: value.device?.toString() || "",
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
                    devices={devices}
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
