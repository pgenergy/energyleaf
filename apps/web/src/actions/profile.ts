"use server";

import { revalidatePath } from "next/cache";
import type { baseInfromationSchema, mailSettingsSchema, userDataSchema } from "@/lib/schema/profile";

import { getUserById, updateMailSettings, updateUser, updateUserData } from "@energyleaf/db/query";

import "server-only";

import type { z } from "zod";

export async function updateBaseInformation(data: z.infer<typeof baseInfromationSchema>, id: number | string) {
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
        await updateUserData({
            budget: data.budget,
            wohnfläche: data.houseSize,
            household: data.people,
            immobilie: data.houseType,
            warmwasser: data.warmWater,
            tarif: data.tarif,
            basispreis: data.price,
        }, user.id);
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating user");
    }
}
