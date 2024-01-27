"use client";

import { createContext, useContext, useState } from "react";

export type DeviceContextType = {
    device?: { id: number; name: string; created: Date | null };
    setDevice: (device?: { id: number; name: string; created: Date | null }) => void;
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
    const [device, setDevice] = useState<{ id: number; name: string; created: Date | null } | undefined>(undefined);

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
