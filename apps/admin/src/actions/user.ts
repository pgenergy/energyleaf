"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { env } from "@/env.mjs";
import { checkIfAdmin } from "@/lib/auth/auth.action";
import type { userStateSchema } from "@/lib/schema/user";
import type { z } from "zod";

import {
    deleteUser as deleteUserDb,
    getAllUsers as getAllUsersDb,
    getUserById,
    setUserActive as setUserActiveDb,
    setUserAdmin as setUserAdminDb,
    updateUser as updateUserDb,
} from "@energyleaf/db/query";
import type { baseInformationSchema } from "@energyleaf/lib";
import { sendAccountActivatedEmail } from "@energyleaf/mail";

export async function getAllUsersAction() {
    await checkIfAdmin();

    // strip password from response before it is sent to the client
    return (await getAllUsersDb()).map((user) => ({
        ...user,
        password: "",
    }));
}

export async function setUserActive(id: string, active: boolean) {
    await checkIfAdmin();
    try {
        await setUserActiveDb(id, active);
        if (active) {
            const user = await getUserById(id);
            if (user) {
                await sendAccountActivatedEmail({
                    to: user.email,
                    name: user.username,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                });
            }
        }
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user active");
    }
}

export async function setUserAdmin(id: string, isAdmin: boolean) {
    await checkIfAdmin();

    try {
        await setUserAdminDb(id, isAdmin);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to set user admin");
    }
}

export async function deleteUser(id: string) {
    await checkIfAdmin();

    try {
        await deleteUserDb(id);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to delete user");
    }
}

export async function updateUser(data: z.infer<typeof baseInformationSchema>, id: string) {
    await checkIfAdmin();

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
    await checkIfAdmin();

    try {
        await updateUserDb({
            isAdmin: data.isAdmin,
            isActive: data.active,
            appVersion: data.appVersion
        }, id);
        revalidatePath("/users");
    } catch (e) {
        throw new Error("Failed to update user");
    }
}