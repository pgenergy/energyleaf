"use client";

import type { UserSelectType } from "@energyleaf/db/types";
import type { AggregationType } from "@energyleaf/lib";
import type React from "react";
import { createContext, useContext, useState } from "react";

export type UserContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    passwordResetDialogOpen: boolean;
    setPasswordResetDialogOpen: (open: boolean) => void;
    user: UserSelectType | undefined;
    setUser: (sensor: UserSelectType | undefined) => void;
    aggregationType: AggregationType | undefined;
    setAggregationType: (aggregationType: AggregationType) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    zoomed: boolean;
    setZoomed: (zoomed: boolean) => void;
} | null;

const userContext = createContext<UserContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserContextProvider({ children }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
    const [user, setUser] = useState<UserSelectType | undefined>(undefined);
    const [aggregationType, setAggregationType] = useState<AggregationType | undefined>(undefined);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [zoomed, setZoomed] = useState(false);

    return (
        <userContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
                passwordResetDialogOpen,
                setPasswordResetDialogOpen,
                user,
                setUser,
                aggregationType,
                setAggregationType,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                zoomed,
                setZoomed,
            }}
        >
            {children}
        </userContext.Provider>
    );
}

export const useUserContext = () => {
    const context = useContext(userContext);

    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }

    return context;
};
