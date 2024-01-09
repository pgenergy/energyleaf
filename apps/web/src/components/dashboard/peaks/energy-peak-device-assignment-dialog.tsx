import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";
import type { Peak } from "@/types/peaks/peak";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: Peak;
    devices: { id: number; userId: number; name: string; created: Date | null; }[];
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, devices }: Props) {
    const initialValues = {
        deviceId: value.device?.toString() || ""
    };

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>Wähle ein Gerät aus, was diesen Verbrauch verursacht hat.</DialogDescription>
                </DialogHeader>
                <p>Verbrauch: {value.energy}</p>
                <EnergyPeakDeviceAssignmentForm devices={devices} initialValues={initialValues} onInteract={() => { setOpen(false) }} sensorDataId={value.id}/>
            </DialogContent>
        </Dialog>
    );
}