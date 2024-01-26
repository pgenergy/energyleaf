"use client";

import React, { createContext, useContext, useState } from "react";
import type {UserTableType} from "@/components/users/table/users-table-columns";

export type UserContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    user: UserTableType | undefined;
    setUser: (sensor: UserTableType | undefined) => void;
} | null;

const userContext = createContext<UserContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserContextProvider({ children }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [user, setUser] = useState<UserTableType | undefined>(undefined);

    return (
        <userContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
                user: user,
                setUser: setUser
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