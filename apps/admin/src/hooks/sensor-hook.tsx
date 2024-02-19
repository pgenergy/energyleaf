"use client";

import React, { createContext, useContext, useState } from "react";
import type {SensorTableType} from "@/components/sensors/table/sensors-columns";

export type SensorContextType = {
    addDialogOpen: boolean;
    setAddDialogOpen: (open: boolean) => void;
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    sensor: SensorTableType | undefined;
    setSensor: (sensor: SensorTableType | undefined) => void;
} | null;

const sensorContext = createContext<SensorContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function SensorContextProvider({ children }: Props) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sensor, setSensor] = useState<SensorTableType | undefined>(undefined);

    return (
        <sensorContext.Provider
            value={{
                addDialogOpen,
                setAddDialogOpen,
                deleteDialogOpen,
                setDeleteDialogOpen,
                sensor,
                setSensor
            }}
        >
            {children}
        </sensorContext.Provider>
    );
}

export const useSensorContext = () => {
    const context = useContext(sensorContext);

    if (!context) {
        throw new Error("useDeviceContext must be used within a DeviceProvider");
    }

    return context;
};
