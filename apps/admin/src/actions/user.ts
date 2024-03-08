"use server";

import "server-only";

import {revalidatePath} from "next/cache";
import {getSession} from "@/lib/auth/auth";
import type {userStateSchema} from "@/lib/schema/user";
import type {z} from "zod";

import {
    deleteUser as deleteUserDb, getAllUsers as getAllUsersDb,
    setUserActive as setUserActiveDb,
    setUserAdmin as setUserAdminDb,
    updateUser as updateUserDb,
} from "@energyleaf/db/query";
import type {baseInformationSchema} from "@energyleaf/lib";
import {UserNotLoggedInError} from "@energyleaf/lib";

export async function setUserActive(id: number, active: boolean) {
    await validateUserAdmin();

    try {
        await setUserActiveDb(id, active);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user active");
    }
}

export async function setUserAdmin(id: number, isAdmin: boolean) {
    await validateUserAdmin();

    try {
        await setUserAdminDb(id, isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user admin");
    }
}

export async function deleteUser(id: number) {
    await validateUserAdmin();
    try {
        await deleteUserDb(id);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to delete user");
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
            id,
        );
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to update user");
    }
}

export async function updateUserState(data: z.infer<typeof userStateSchema>, id: number) {
    await validateUserAdmin();

    try {
        await setUserActiveDb(id, data.active);
        await setUserAdminDb(id, data.isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to update user");
    }
}

export async function getAllUsers() {
    await validateUserAdmin();
    return getAllUsersDb();
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
