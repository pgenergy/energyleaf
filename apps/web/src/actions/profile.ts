"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import { isDemoUser, updateUserDataCookieStore } from "@/lib/demo/demo";
import type {
    deleteAccountSchema,
    mailSettingsSchema,
    passwordSchema,
    userDataSchema,
    userGoalSchema,
} from "@/lib/schema/profile";
import {
    deleteSessionsOfUser,
    deleteUser,
    getUserById,
    updatePassword,
    updateReportSettings,
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
    try {
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
                    firstname: data.firstname,
                    lastName: data.lastname,
                    phone: data.phone,
                    address: data.address,
                    username: data.username,
                    email: data.email,
                },
                user.id,
            );
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            return {
                success: false,
                message: "Es gab einen Fehler beim Speichern.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Profil zu bearbeiten.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateBaseInformationPassword(data: z.infer<typeof passwordSchema>) {
    try {
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
            return {
                success: false,
                message: "Fehler beim aktualisieren ihres Passworts.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Passwort zu ändern.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateMailInformation(data: z.infer<typeof mailSettingsSchema>) {
    try {
        const { user, session } = await getActionSession();

        if (!session) {
            throw new UserNotLoggedInError();
        }

        const dbuser = await getUserById(user.id);
        if (!dbuser) {
            throw new UserNotFoundError();
        }

        try {
            await updateReportSettings(
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
            return {
                success: false,
                message: "Es ist ein Fehler beim Ändern der E-Mail Einstellung aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre E-Mail Einstellungen zu ändern.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateUserDataInformation(data: z.infer<typeof userDataSchema>) {
    try {
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
            return {
                success: false,
                message: "Ein Fehler beim Ändern ihrer Daten ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Daten zu ändern.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateUserGoals(data: z.infer<typeof userGoalSchema>) {
    try {
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
            return {
                success: false,
                message: "Ein Fehler beim Speichern Ihrer Ziele ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Ziele zu aktualisieren.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten",
        };
    }
}

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
    try {
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
            await deleteSessionsOfUser(user.id);
            cookies().delete(lucia.sessionCookieName);
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            return {
                success: false,
                message: "Ein Fehler beim löschen Ihrers Accounts ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihren Account zu löschen.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten",
        };
    }
}

function revalidateUserDataPaths() {
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
}
