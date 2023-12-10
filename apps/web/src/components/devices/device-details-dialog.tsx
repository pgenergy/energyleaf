'use client';

import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui";
import DeviceDetailsForm from "./device-details-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    userId: string;
    device?: { id: Number, name: String };
}

export default function DeviceDetailsDialog({ open, setOpen, userId, device}: Props) {
    var dialogTitle = "Gerät hinzufügen"
    if (device) {
        dialogTitle = "Gerät-Details"
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    {dialogTitle}
                </DialogHeader>
                <DeviceDetailsForm userId={userId} onInteract={() => setOpen(false)} device={device}/>
            </DialogContent>
        </Dialog>
    )
}