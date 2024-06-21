import type { ConsumptionData } from "@energyleaf/lib";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui/dialog";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: ConsumptionData;
    userId: string;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, userId }: Props) {
    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>
                        Wählen Sie die Geräte aus, die diesen Verbrauch verursacht haben.
                    </DialogDescription>
                </DialogHeader>
                <p>Verbrauch: {value.energy}</p>
                <EnergyPeakDeviceAssignmentForm
                    userId={userId}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorDataId={value.sensorDataId}
                />
            </DialogContent>
        </Dialog>
    );
}
