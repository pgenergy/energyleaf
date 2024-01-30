"use server";

import 'server-only';
import {
    getAllUsers as getAllUsersDb,
    setUserActive as setUserActiveDb,
    deleteUser as deleteUserDb,
    toggleUserAdmin as toggleUserAdminDb
} from "@energyleaf/db/query";
import {cache} from "react";
import {getSession} from "@/lib/auth/auth";
import {UserNotLoggedInError} from "@energyleaf/lib";
import {revalidatePath} from "next/cache";

export const getAllUsers = cache(async () => {
    await validateUserAdmin();

    return await getAllUsersDb();
});

export async function setUserActive(id: number, active: boolean) {
    await validateUserAdmin();

    try {
        await setUserActiveDb(id, active);
        revalidatePath("/users")
    } catch (e) {
        throw new Error("Failed to set user active");
    }
}

export async function toggleUserAdmin(id: number) {
    await validateUserAdmin();

    try {
        await toggleUserAdminDb(id);
        revalidatePath("/users")
    } catch (e) {
        throw new Error("Failed to set user admin");
    }
}

export async function deleteUser(id: number) {

    await validateUserAdmin();
    try {
        await deleteUserDb(id);
        revalidatePath("/users")
    } catch (e) {
        throw new Error("Failed to delete user");
    }
}

async function validateUserAdmin() {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (!session.user.admin) {
        throw new Error("User is not an admin");
    }
}