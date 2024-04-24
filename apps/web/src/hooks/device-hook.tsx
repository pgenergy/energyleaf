"use client";

import type { DeviceSelectType } from "@energyleaf/db/types";
import { createContext, useContext, useState } from "react";

export type DeviceContextType = {
    device?: DeviceSelectType;
    setDevice: (device?: DeviceSelectType) => void;
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
} | null;

const deviceContext = createContext<DeviceContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function DeviceContextProvider({ children }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [device, setDevice] = useState<DeviceSelectType | undefined>(undefined);

    return (
        <deviceContext.Provider
            value={{
                device,
                setDevice,
                dialogOpen,
                setDialogOpen,
                deleteDialogOpen,
                setDeleteDialogOpen,
            }}
        >
            {children}
        </deviceContext.Provider>
    );
}

export const useDeviceContext = () => {
    const context = useContext(deviceContext);

    if (!context) {
        throw new Error("useDeviceContext must be used within a DeviceProvider");
    }

    return context;
};
