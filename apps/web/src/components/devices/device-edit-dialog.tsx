"use client";

import { useDeviceContext } from "@/hooks/device-hook";
import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui/dialog";
import DeviceDetailsForm from "./device-details-form";

export default function DeviceEditDialog() {
    const deviceContext = useDeviceContext();

    return (
        <Dialog
            onOpenChange={(value) => {
                deviceContext.setDialogOpen(value);
                deviceContext.setDevice(undefined);
            }}
            open={deviceContext.dialogOpen}
        >
            <DialogContent>
                <DialogHeader>{deviceContext.device ? "Gerät bearbeiten" : "Gerät hinzufügen"}</DialogHeader>
                <DeviceDetailsForm
                    device={deviceContext.device}
                    onCallback={() => {
                        deviceContext.setDialogOpen(false);
                        deviceContext.setDevice(undefined);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
