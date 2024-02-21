"use client";

import React, {createContext, useContext, useState} from "react";

export type UserDetailsContextType = {
    deleteDialogOpen: boolean;
    setDeleteDialogOpen: (open: boolean) => void;
    resetPasswordDialogOpen: boolean;
    setResetPasswordDialogOpen: (open: boolean) => void;
    user: { id: number; username: string; } | undefined;
    setUser: (user: { id: number; username: string; } | undefined) => void;
} | null;

const userDetailsContext = createContext<UserDetailsContextType>(null);

interface Props {
    children: React.ReactNode;
}

export function UserDetailsContextProvider({children}: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [user, setUser] = useState<{ id: number; username: string; } | undefined>(undefined);

    return (
        <userDetailsContext.Provider
            value={{
                deleteDialogOpen,
                setDeleteDialogOpen,
                resetPasswordDialogOpen,
                setResetPasswordDialogOpen,
                user,
                setUser
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