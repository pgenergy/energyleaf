"use server";

import { revalidatePath } from "next/cache";
import type {
    baseInfromationSchema,
    deleteAccountSchema,
    mailSettingsSchema,
    passwordSchema,
    userDataSchema,
} from "@/lib/schema/profile";
import { PasswordsDoNotMatchError } from "@/types/errors/passwords-do-not-match-error";
import * as bcrypt from "bcryptjs";

import {
    deleteUser,
    getUserById,
    updateMailSettings,
    updatePassword,
    updateUser,
    updateUserData,
} from "@energyleaf/db/query";

import "server-only";

import type { z } from "zod";

export async function updateBaseInformationUsername(data: z.infer<typeof baseInfromationSchema>, id: number | string) {
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
                dailyTime: data.dailyTime,
                weekly: data.weekly,
                weeklyDay: data.weeklyDay,
                weeklyTime: data.weeklyTime,
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
                livingSpace: data.livingSpace,
                household: data.people,
                property: data.houseType,
                hotWater: data.hotWater,
                tariff: data.tariff,
                basePrice: data.basePrice,
                monthlyPayment: data.monthlyPayment,
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
