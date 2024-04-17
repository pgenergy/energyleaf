"use client";

import React, { createContext, useContext, useState } from "react";

import type { SensorSelectType } from "@energyleaf/db/types";

export type SensorContextType = {
    addDialogOpen: boolean;
    setAddDialogOpen: (open: boolean) => void;
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    editDialogOpen: boolean;
    setEditDialogOpen: (open: boolean) => void;
    addValueDialogOpen: boolean;
    setAddValueDialogOpen: (open: boolean) => void;
    sensor: SensorSelectType | undefined;
    setSensor: (sensor: SensorSelectType | undefined) => void;
} | null;

const sensorContext = createContext<SensorContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function SensorContextProvider({ children }: Props) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addValueDialogOpen, setAddValueDialogOpen] = useState(false);
    const [sensor, setSensor] = useState<SensorSelectType | undefined>(undefined);

    return (
        <sensorContext.Provider
            value={{
                addDialogOpen,
                setAddDialogOpen,
                deleteDialogOpen,
                setDeleteDialogOpen,
                editDialogOpen,
                setEditDialogOpen,
                addValueDialogOpen,
                setAddValueDialogOpen,
                sensor,
                setSensor,
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
