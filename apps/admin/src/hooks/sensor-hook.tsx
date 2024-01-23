"use client";

import React, { createContext, useContext, useState } from "react";

export type SensorContextType = {
    addDialogOpen: boolean;
    setAddDialogOpen: (open: boolean) => void;
} | null;

const sensorContext = createContext<SensorContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function SensorContextProvider({ children }: Props) {
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    return (
        <sensorContext.Provider
            value={{
                addDialogOpen,
                setAddDialogOpen,
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
