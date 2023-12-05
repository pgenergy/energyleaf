'use client';

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, Button } from "@energyleaf/ui";
import CreateDeviceForm from "./create-device-form";
import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
    userId: string;
}

export default function CreateDeviceDialog({ userId }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2"/>
                    Gerät hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    Gerät hinzufügen
                </DialogHeader>
                <CreateDeviceForm userId={userId} onInteract={() => setOpen(false)}/>
            </DialogContent>
        </Dialog>
    )
}