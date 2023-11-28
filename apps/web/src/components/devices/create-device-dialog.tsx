'use client';

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, Button } from "@energyleaf/ui";
import CreateDeviceForm from "./create-device-form";
import { useState } from "react";

export default function CreateDeviceDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)}>Gerät hinzufügen</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    Gerät hinzufügen
                </DialogHeader>
                <DialogDescription>
                    Hier kannst du ein neues Gerät hinzufügen.
                </DialogDescription>
                <CreateDeviceForm onInteract={() => setOpen(false)}/>
            </DialogContent>
        </Dialog>
    )
}