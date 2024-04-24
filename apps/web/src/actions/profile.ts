"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { isDemoUser, updateUserDataCookieStore } from "@/lib/demo/demo";
import type {
    deleteAccountSchema,
    passwordSchema,
    reportSettingsSchema,
    userDataSchema,
    userGoalSchema,
} from "@/lib/schema/profile";
import {
    deleteUser,
    getUserById,
    updatePassword,
    updateReportConfig,
    updateUser,
    updateUserData,
} from "@energyleaf/db/query";
import type { UserDataType } from "@energyleaf/db/types";
import type { baseInformationSchema } from "@energyleaf/lib";
import { PasswordsDoNotMatchError, UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";
import "server-only";
import type { z } from "zod";

export async function updateBaseInformationUsername(data: z.infer<typeof baseInformationSchema>) {
    const { user, session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    const dbuser = await getUserById(user.id);
    if (!dbuser) {
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
    const { user, session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const dbuser = await getUserById(user.id);
    if (!dbuser) {
        throw new UserNotFoundError();
    }
    const match = await new Argon2id().verify(dbuser.password, data.oldPassword);
    if (!match) {
        throw new PasswordsDoNotMatchError();
    }

    const hash = await new Argon2id().hash(data.newPassword);
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

export async function updateReportConfigSettings(data: z.infer<typeof reportSettingsSchema>) {
    const { user, session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
        throw new UserNotFoundError();
    }

    try {
        await updateReportConfig(
            {
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time,
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
    const { user, session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        updateUserDataCookieStore(cookies(), {
            user_data: {
                timestamp: new Date(),
                hotWater: data.hotWater,
                tariff: data.tariff,
                basePrice: data.basePrice,
                monthlyPayment: data.monthlyPayment,
                livingSpace: data.livingSpace,
                household: data.people,
                property: data.houseType,
            },
        } as Partial<UserDataType>);
        revalidateUserDataPaths();
        return;
    }

    const dbuser = await getUserById(user.id);
    if (!dbuser) {
        throw new UserNotFoundError();
    }

    try {
        await updateUserData(
            {
                timestamp: new Date(),
                livingSpace: data.livingSpace,
                household: data.people,
                property: data.houseType,
                hotWater: data.hotWater,
                tariff: data.tariff,
                basePrice: data.basePrice,
                workingPrice: data.workingPrice,
                monthlyPayment: data.monthlyPayment,
            },
            user.id,
        );
        revalidateUserDataPaths();
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function updateUserGoals(data: z.infer<typeof userGoalSchema>) {
    const { user, session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        updateUserDataCookieStore(cookies(), {
            user_data: {
                timestamp: new Date(),
                consumptionGoal: data.goalValue,
            },
        } as Partial<UserDataType>);
        revalidateUserDataPaths();
        return;
    }

    const dbuser = await getUserById(user.id);
    if (!dbuser) {
        throw new UserNotFoundError();
    }

    try {
        await updateUserData(
            {
                timestamp: new Date(),
                consumptionGoal: data.goalValue,
            },
            user.id,
        );
        revalidateUserDataPaths();
    } catch (e) {
        throw new Error("Error while updating user");
    }
}

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
    const { user, session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    const dbuser = await getUserById(user.id);
    if (!dbuser) {
        throw new UserNotFoundError();
    }

    const match = await new Argon2id().verify(dbuser.password, data.password);
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

function revalidateUserDataPaths() {
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
}
