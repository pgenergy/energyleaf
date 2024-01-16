"use client";

import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui";

import DeviceDetailsForm from "./device-details-form";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    userId: string;
    device?: { id: number; name: string };
}

export default function DeviceDetailsDialog({ open, setOpen, userId, device }: Props) {
    let dialogTitle = "Gerät hinzufügen";
    if (device) {
        dialogTitle = "Gerät-Details";
    }

    return (
        <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent>
                <DialogHeader>{dialogTitle}</DialogHeader>
                <DeviceDetailsForm
                    device={device}
                    onInteract={() => {
                        setOpen(false);
                    }}
                    userId={userId}
                />
            </DialogContent>
        </Dialog>
    );
}
