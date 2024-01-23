"use client";

import { useSensorContext } from "@/hooks/sensor-hook";
import { PlusIcon } from "lucide-react";

import { Button } from "@energyleaf/ui";

export default function SensorAddButton() {
    const sensorContext = useSensorContext();

    function openDialog() {
        sensorContext.setAddDialogOpen(true);
        console.log(sensorContext)
    }

    return (
        <Button className="flex flex-row gap-2" onClick={openDialog}>
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline-block">Sensor hinzufügen</span>
        </Button>
    );
}