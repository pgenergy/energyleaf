"use client";

import React, { createContext, useContext, useState } from "react";

import type {UserSelectType} from "@energyleaf/db/types";
import {AggregationType} from "@energyleaf/lib";

export type UserDetailsContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    resetPasswordDialogOpen: boolean;
    setResetPasswordDialogOpen: (open: boolean) => void;
    user: UserSelectType | undefined;
    setUser: (user: UserSelectType | undefined) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    aggregationType: AggregationType;
    setAggregationType: (aggregationType: AggregationType) => void;
} | null;

const userDetailsContext = createContext<UserDetailsContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserDetailsContextProvider({ children }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [user, setUser] = useState<UserSelectType | undefined>(undefined);

    const date = new Date();
    const [startDate, setStartDate] = useState(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    const [endDate, setEndDate] = useState(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59));

    const [aggregationType, setAggregationType] = useState<AggregationType>(AggregationType.RAW);

    return (
        <userDetailsContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
                resetPasswordDialogOpen,
                setResetPasswordDialogOpen,
                user,
                setUser,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                aggregationType,
                setAggregationType
            }}
        >
            {children}
        </userDetailsContext.Provider>
    );
}

export const useUserDetailsContext = () => {
    const context = useContext(userDetailsContext);

    if (!context) {
        throw new Error("useUserContext must be used within a UserDetailsContextProvider");
    }

    return context;
};
