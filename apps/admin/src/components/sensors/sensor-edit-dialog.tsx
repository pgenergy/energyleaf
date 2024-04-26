"use client";

import SensorDetailsForm from "@/components/sensors/sensor-details-form";
import { useSensorContext } from "@/hooks/sensor-hook";
import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui";

export default function SensorEditDialog() {
    const sensorContext = useSensorContext();

    return (
        <Dialog
            onOpenChange={(value) => {
                sensorContext.setEditDialogOpen(value);
                sensorContext.setSensor(undefined);
            }}
            open={sensorContext.editDialogOpen}
        >
            <DialogContent>
                <DialogHeader>Sensor bearbeiten</DialogHeader>
                <SensorDetailsForm
                    onCallback={() => {
                        sensorContext.setEditDialogOpen(false);
                        sensorContext.setSensor(undefined);
                    }}
                    sensor={sensorContext.sensor}
                />
            </DialogContent>
        </Dialog>
    );
}
