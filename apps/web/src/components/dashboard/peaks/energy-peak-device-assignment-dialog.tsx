import type { SensorDataSequenceType } from "@energyleaf/db/types";
import { formatNumber } from "@energyleaf/lib";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui/dialog";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";
import { Versions, fulfills } from "@energyleaf/lib/versioning";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: SensorDataSequenceType;
    userId: string;
    appVersion: number;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, userId, appVersion }: Props) {
    const showStandardDeviceHint = fulfills(appVersion, Versions.support);

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Geräteauswahl</DialogTitle>
                    <DialogDescription>
                        Wählen Sie die Geräte aus, die diesen Verbrauch verursacht haben.
                        {showStandardDeviceHint && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Hinweis: Unsere KI hat möglicherweise bereits Geräte erkannt, die diesen Verbrauch verursacht
                                haben. Falls diese falsch erkannt wurden, wählen Sie bitte die richtigen Geräte aus.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <p>Leistung: {formatNumber(value.averagePeakPower)} Watt</p>
                <EnergyPeakDeviceAssignmentForm
                    userId={userId}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    sensorDataSequenceId={value.id}
                />
            </DialogContent>
        </Dialog>
    );
}
