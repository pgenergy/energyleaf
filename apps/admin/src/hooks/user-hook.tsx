"use client";

import React, { createContext, useContext, useState } from "react";

import type { UserSelectType } from "@energyleaf/db/types";

export type UserContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    passwordResetDialogOpen: boolean;
    setPasswordResetDialogOpen: (open: boolean) => void;
    user: UserSelectType | undefined;
    setUser: (sensor: UserSelectType | undefined) => void;
} | null;

const userContext = createContext<UserContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserContextProvider({ children }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
    const [user, setUser] = useState<UserSelectType | undefined>(undefined);

    return (
        <userContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
                passwordResetDialogOpen,
                setPasswordResetDialogOpen,
                user,
                setUser,
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
