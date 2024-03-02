"use client";

import type { UserSelectType } from "@energyleaf/db/types";
import React, { createContext, useContext, useState } from "react";

export type UserContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    user: UserSelectType | undefined;
    setUser: (sensor: UserSelectType | undefined) => void;
} | null;

const userContext = createContext<UserContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserContextProvider({ children }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [user, setUser] = useState<UserSelectType | undefined>(undefined);

    return (
        <userContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
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
