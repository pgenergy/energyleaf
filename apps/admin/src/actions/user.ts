"use server";

import 'server-only';
import {
    getAllUsers as getAllUsersDb,
    setUserActive as setUserActiveDb,
    deleteUser as deleteUserDb,
    toggleUserAdmin as toggleUserAdminDb,
    getUserById,
    updateUser as updateUserDb
} from "@energyleaf/db/query";
import {cache} from "react";
import {getSession} from "@/lib/auth/auth";
import {UserNotLoggedInError} from "@energyleaf/lib";
import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {baseInformationSchema} from "@energyleaf/lib";

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

export async function getUser(id: number) {
    await validateUserAdmin();

    try {
        return await getUserById(id);
    } catch (e) {
        throw new Error("Failed to get user");
    }
}

export async function updateUser(data: z.infer<typeof baseInformationSchema>, id: number) {
    await validateUserAdmin();

    try {
        await updateUserDb(
            {
                username: data.username,
                email: data.email,
            },
            id
        );
        revalidatePath("/users")
    } catch (e) {
        throw new Error("Failed to update user");
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