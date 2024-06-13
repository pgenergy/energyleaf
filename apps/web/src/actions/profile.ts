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
    getUserById, logError, trackAction,
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
import {waitUntil} from "@vercel/functions";
import {Session} from "lucia";

export async function updateBaseInformationUsername(data: z.infer<typeof baseInformationSchema>) {
    try {
        const { session } = await getActionSession();
        const userDataToLog = "private"
        if (!session) {
            throw new UserNotLoggedInError();
        }

        const dbuser = await getUserById(session.userId);
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
            waitUntil(
                trackAction(
                    "user/update-base-information",
                    "update-base-information",
                    "web",
                    { userDataToLog, session },

                )
            )
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(
                logError(
                    "user/not-updated",
                    "update-base-information",
                    "web",
                    { userDataToLog, session },
                    e,
                )
            )
            return {
                success: false,
                message: "Es gab einen Fehler beim Speichern.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(
                logError(
                    "user/not-logged-in",
                    "update-base-information",
                    "web",
                    {userDataToLog, session},
                    err,
                )
            )
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Profil zu bearbeiten.",
            };
        }
        waitUntil(
            logError(
                "profile/error",
                "update-base-information",
                "web",
                {userDataToLog, session},
                err,
            )
        )
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
            waitUntil(
                trackAction(
                    "user/update-password",
                    "update-password",
                    "web",
                    { session },
                )
            )
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(
                logError(
                    "user/not-updated",
                    "update-password",
                    "web",
                    { session },
                    e,
                )
            )
            return {
                success: false,
                message: "Fehler beim aktualisieren ihres Passworts.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(
                logError(
                    "user/not-logged-in",
                    "update-password",
                    "web",
                    {},
                    err,
                )
            )
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Passwort zu ändern.",
            };
        }
        waitUntil(
            logError(
                "profile/error",
                "update-password",
                "web",
                {},
                err,
            )
        )
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
    let session;
    try {
        session = ((await getActionSession())?.session as Session);

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
            waitUntil(
                trackAction(
                    "user/update-data-demo ",
                    "update-user-data",
                    "web",
                    { session },
                )
            )
            return;
        }

        const dbuser = await getUserById(session.userId);
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
                session.userId,
            );
            waitUntil(
                trackAction(
                    "user/updated-data",
                    "update-user-data",
                    "web",
                    { data, session },
                )
            )
            revalidateUserDataPaths();
        } catch (e) {
            waitUntil(
                logError(
                    "user/error-updating-data",
                    "update-user-data",
                    "web",
                    { data, session },
                    e,
                )
            )
            return {
                success: false,
                message: "Ein Fehler beim Ändern ihrer Daten ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(
                logError(
                    "user/not-logged-in",
                    "update-user-data",
                    "web",
                    { data, session },
                    err,
                )
            )
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Daten zu ändern.",
            };
        }
        waitUntil(
            logError(
                "profile/error",
                "update-user-data",
                "web",
                { data, session },
                err,
            )
        )
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
            trackAction(
                "user/update-goals-demo",
                "update-user-goals",
                "web",
                { data, session },
            )
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
            waitUntil(
                trackAction(
                    "user/updated-goals",
                    "update-user-goals",
                    "web",
                    { data, session },
                )
            )
            revalidateUserDataPaths();
        } catch (e) {
            waitUntil(
                logError(
                    "user/error-updating-goals",
                    "update-user-goals",
                    "web",
                    { data, session },
                    e,
                )
            )
            return {
                success: false,
                message: "Ein Fehler beim Speichern Ihrer Ziele ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(
                logError(
                    "user/not-logged-in",
                    "update-user-goals",
                    "web",
                    {},
                    err,
                )
            )
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Ziele zu aktualisieren.",
            };
        }
        waitUntil(
            logError(
                "profile/error",
                "update-user-goals",
                "web",
                {},
                err,
            )
        )
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
            waitUntil(
                trackAction(
                    "user/deleted-account",
                    "delete-account",
                    "web",
                    { session, "userId": user.id },
                )
            )
            cookies().delete(lucia.sessionCookieName);
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(
                logError(
                    "user/error-deleting",
                    "delete-account",
                    "web",
                    { session },
                    e,
                )
            )
            return {
                success: false,
                message: "Ein Fehler beim löschen Ihrers Accounts ist aufgetreten.",
            };
        }
    } catch (err) {
        waitUntil(
            logError(
                "user/error",
                "delete-account",
                "web",
                {},
                err,
            )
        )
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihren Account zu löschen.",
            };
        }
        waitUntil(
            logError(
                "user/error",
                "delete-account",
                "web",
                {},
                err,
            )
        )
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
