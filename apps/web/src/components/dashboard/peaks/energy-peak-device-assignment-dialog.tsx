import type { ConsumptionData } from "@energyleaf/lib";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@energyleaf/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EnergyPeakDeviceAssignmentForm } from "./energy-peak-device-assignment-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: ConsumptionData;
    userId: string;
}

export function EnergyPeakDeviceAssignmentDialog({ open, setOpen, value, userId }: Props) {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
}
