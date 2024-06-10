"use client";

import { useDeviceContext } from "@/hooks/device-hook";
import { Button } from "@energyleaf/ui/button";
import { track } from "@vercel/analytics";
import { PlusIcon } from "lucide-react";

export default function DeviceAddButton() {
    const deviceContext = useDeviceContext();

    function openDialog() {
        deviceContext.setDevice(undefined);
        deviceContext.setDialogOpen(true);
    }

    return (
        <Button
            className="flex flex-row gap-2"
            onClick={() => {
                track("openDialog(addDevice)");
                openDialog();
            }}
        >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline-block">Gerät hinzufügen</span>
        </Button>
    );
}
