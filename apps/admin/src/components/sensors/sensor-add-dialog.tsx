"use client";

import { Dialog, DialogContent, DialogHeader } from "@energyleaf/ui";
import {useSensorContext} from "@/hooks/sensor-hook";
import SensorDetailsForm from "@/components/sensors/sensor-details-form";

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
                <DialogHeader>{"Sensor hinzufügen"}</DialogHeader>
                <SensorDetailsForm
                    onCallback={() => {
                        sensorContext.setAddDialogOpen(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
