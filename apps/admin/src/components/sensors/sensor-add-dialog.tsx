"use client";

import SensorDetailsForm from "@/components/sensors/sensor-details-form";
import { useSensorContext } from "@/hooks/sensor-hook";

import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui";

export default function SensorAddDialog() {
    const sensorContext = useSensorContext();

    return (
        <Dialog
            onOpenChange={(value) => {
                sensorContext.setAddDialogOpen(value);
            }}
            open={sensorContext.addDialogOpen}
        >
            <DialogContent>
                <DialogHeader>Sensor hinzufügen</DialogHeader>
                <SensorDetailsForm
                    onCallback={() => {
                        sensorContext.setAddDialogOpen(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
