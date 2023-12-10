"use server";

import * as bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { baseInformationSchema, deleteAccountSchema, mailSettingsSchema, passwordSchema, userDataSchema } from "@/lib/schema/profile";
import { PasswordsDoNotMatchError } from "../types/errors/PasswordsDoNotMatchError";

import { getUserById, updateMailSettings, updatePassword, updateUser, updateUserData, deleteUser } from "@energyleaf/db/query";

import "server-only";

import type { z } from "zod";

export async function updateBaseInformation(data: z.infer<typeof baseInformationSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }

    try {
        await updateUser(
            {
                username: data.username,
                email: data.email,
            },
            user.id,
        );
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function updateBaseInformationPassword(data: z.infer<typeof passwordSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(data.oldPassword, user.password);
    if (!match) {
        throw new PasswordsDoNotMatchError();
    }

    const hash = await bcrypt.hash(data.newPassword, 10);
    try {
        await updatePassword(
            {
                password: hash,
            },
            user.id,
        );
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating password");
    }
}

export async function updateMailInformation(data: z.infer<typeof mailSettingsSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }

    try {
        await updateMailSettings(
            {
                daily: data.daily,
                weekly: data.weekly,
            },
            user.id,
        );
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function updateUserDataInformation(data: z.infer<typeof userDataSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }

    try {
        await updateUserData(
            {
                timestamp: new Date(),
                budget: data.budget,
                wohnfläche: data.houseSize,
                household: data.people,
                immobilie: data.houseType,
                warmwasser: data.warmWater,
                tarif: data.tarif,
                basispreis: data.price,
            },
            user.id,
        );
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
        throw new PasswordsDoNotMatchError();
    }

    try {
        await deleteUser(user.id);
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while deleting account");
    }
}