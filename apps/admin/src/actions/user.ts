"use server";

import "server-only";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import type { userStateSchema } from "@/lib/schema/user";
import type { z } from "zod";

import {
    deleteUser as deleteUserDb,
    getAllUsers as getAllUsersDb,
    getSensorsByUser as getSensorsByUserDb,
    getUserById,
    setUserActive as setUserActiveDb,
    setUserAdmin as setUserAdminDb,
    updateUser as updateUserDb,
} from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib";
import type { baseInformationSchema } from "@energyleaf/lib";

export const getAllUsers = cache(async () => {
    await validateUserAdmin();

    return getAllUsersDb();
});

export async function setUserActive(id: string, active: boolean) {
    await validateUserAdmin();

    try {
        await setUserActiveDb(id, active);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user active");
    }
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    await validateUserAdmin();

    try {
        await setUserAdminDb(id, isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user admin");
    }
}

export async function deleteUser(id: string) {
    await validateUserAdmin();
    try {
        await deleteUserDb(id);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to delete user");
    }
}

export async function getUser(id: string) {
    await validateUserAdmin();

    try {
        return await getUserById(id);
    } catch (e) {
        throw new Error("Failed to get user");
    }
}

export async function updateUser(data: z.infer<typeof baseInformationSchema>, id: string) {
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

export async function updateUserState(data: z.infer<typeof userStateSchema>, id: string) {
    await validateUserAdmin();

    try {
        await setUserActiveDb(id, data.active);
        await setUserAdminDb(id, data.isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to update user");
    }
}

export async function getSensorsByUser(id: string) {
    await validateUserAdmin();

    try {
        return await getSensorsByUserDb(id);
    } catch (e) {
        throw new Error(`Failed to get sensors of user ${id}`);
    }
}

async function validateUserAdmin() {
    const { user, session } = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (!user.isAdmin) {
        throw new Error("User is not an admin");
    }
}
