"use server";

import { revalidatePath } from "next/cache";
import type { deleteAccountSchema, mailSettingsSchema, passwordSchema, userDataSchema } from "@/lib/schema/profile";
import { PasswordsDoNotMatchError } from "@/types/errors/passwords-do-not-match-error";
import * as bcrypt from "bcryptjs";

import {
    deleteUser,
    getUserById,
    updateReportSettings,
    updatePassword,
    updateUser,
    updateUserData,
} from "@energyleaf/db/query";

import "server-only";

import { getSession } from "@/lib/auth/auth";
import type { z } from "zod";

import type { baseInformationSchema } from "@energyleaf/lib";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";

export async function updateBaseInformationUsername(data: z.infer<typeof baseInformationSchema>) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
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

export async function updateBaseInformationPassword(data: z.infer<typeof passwordSchema>) {
    const session = await getSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
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

export async function updateMailInformation(data: z.infer<typeof mailSettingsSchema>) {
    const session = await getSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
    }

    try {
        await updateReportSettings(
            {
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time
            },
            user.id,
        );
        revalidatePath("/profile");
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function updateUserDataInformation(data: z.infer<typeof userDataSchema>) {
    const session = await getSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
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

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
    const session = await getSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
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
