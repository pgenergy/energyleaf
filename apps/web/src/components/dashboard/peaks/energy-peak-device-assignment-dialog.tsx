import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui/dialog";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: SensorDataSequenceType;
    userId: string;
    detectedDevices: { name: string; confidence: number }[];
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, userId, detectedDevices }: Props) {
    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>
                        Wählen Sie die Geräte aus, die diesen Verbrauch verursacht haben.
                    </DialogDescription>
                </DialogHeader>
                <p>Leistung: {formatNumber(value.averagePeakPower)} Watt</p>
                <EnergyPeakDeviceAssignmentForm
                    userId={userId}
                    detectedDevices={detectedDevices}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorDataSequenceId={value.id}
                />
            </DialogContent>
        </Dialog>
    );
}
