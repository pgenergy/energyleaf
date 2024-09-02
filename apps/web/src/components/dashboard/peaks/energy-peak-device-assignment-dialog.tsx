import { formatNumber } from "@energyleaf/lib";
import type { SensorDataSequenceSelectType } from "@energyleaf/postgres/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui/dialog";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: SensorDataSequenceSelectType;
    userId: string;
    appVersion: number;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, appVersion }: Props) {
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
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorDataSequenceId={value.id}
                />
            </DialogContent>
        </Dialog>
    );
}
