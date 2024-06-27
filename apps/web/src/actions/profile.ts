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
    log,
    logError,
    trackAction,
    updateMailSettings,
    updatePassword,
    updateUser,
    updateUserData,
} from "@energyleaf/db/query";
import type { UserDataType } from "@energyleaf/db/types";
import type { baseInformationSchema } from "@energyleaf/lib";
import { PasswordsDoNotMatchError, UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Argon2id, Bcrypt } from "oslo/password";
import "server-only";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import { redirect } from "next/navigation";
import type { z } from "zod";

export async function updateBaseInformationUsername(data: z.infer<typeof baseInformationSchema>) {
    let session: Session | null = null;
    const userDataToLog = "private";
    try {
        session = (await getActionSession())?.session;
        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-base-information", "web", data));
            throw new UserNotLoggedInError();
        }

        const dbuser = await getUserById(session.userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "update-base-information", "web", { data, session }));
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
                session.userId,
            );
            waitUntil(
                trackAction("user/update-base-information", "update-base-information", "web", {
                    userDataToLog,
                    session,
                }),
            );
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(logError("user/not-updated", "update-base-information", "web", { userDataToLog, session }, e));
            return {
                success: false,
                message: "Es gab einen Fehler beim Speichern.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(
                logError("user/not-logged-in", "update-base-information", "web", { userDataToLog, session }, err),
            );
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Profil zu bearbeiten.",
            };
        }
        waitUntil(logError("profile/error", "update-base-information", "web", { userDataToLog, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateBaseInformationPassword(data: z.infer<typeof passwordSchema>) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;

        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-password", "web", data));
            throw new UserNotLoggedInError();
        }

        const dbuser = await getUserById(session.userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "update-password", "web", { data, session }));
            throw new UserNotFoundError();
        }
        const match = await new Argon2id().verify(dbuser.password, data.oldPassword);
        if (!match) {
            waitUntil(log("user/password-not-match", "error", "update-password", "web", { data, session }));
            throw new PasswordsDoNotMatchError();
        }

        const hash = await new Argon2id().hash(data.newPassword);
        try {
            await updatePassword(
                {
                    password: hash,
                },
                session.userId,
            );
            waitUntil(trackAction("user/update-password", "update-password", "web", { session }));
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(logError("user/not-updated", "update-password", "web", { session }, e));
            return {
                success: false,
                message: "Fehler beim aktualisieren ihres Passworts.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-password", "web", {}, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihr Passwort zu ändern.",
            };
        }
        waitUntil(logError("profile/error", "update-password", "web", {}, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateMailInformation(data: z.infer<typeof mailSettingsSchema>) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;

        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-mail-information", "web", data));
            throw new UserNotLoggedInError();
        }

        const dbuser = await getUserById(session.userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "update-mail-information", "web", { data, session }));
            throw new UserNotFoundError();
        }

        try {
            await updateMailSettings(
                {
                    anomalyConfig: {
                        receiveMails: data.receiveAnomalyMails,
                    },
                    reportConfig: {
                        receiveMails: data.receiveReportMails,
                        interval: data.interval,
                        time: data.time,
                    },
                },
                session.userId,
            );
            waitUntil(
                trackAction("user/updated-mail-information", "update-mail-information", "web", { data, session }),
            );
            revalidatePath("/profile");
            revalidatePath("/dashboard");
        } catch (e) {
            waitUntil(
                logError(
                    "user/error-updating-mail-information",
                    "update-mail-information",
                    "web",
                    { data, session },
                    e,
                ),
            );
            return {
                success: false,
                message: "Es ist ein Fehler beim Ändern der E-Mail Einstellung aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-mail-information", "web", { data, session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre E-Mail Einstellungen zu ändern.",
            };
        }
        waitUntil(logError("profile/error", "update-mail-information", "web", { data, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateUserDataInformation(data: z.infer<typeof userDataSchema>) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;

        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-user-data", "web", data));
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
            waitUntil(trackAction("user/update-data-demo ", "update-user-data", "web", { session }));
            return;
        }

        const dbuser = await getUserById(session.userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "update-user-data", "web", data));
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
            waitUntil(trackAction("user/updated-data", "update-user-data", "web", { data, session }));
            revalidateUserDataPaths();
        } catch (e) {
            waitUntil(logError("user/error-updating-data", "update-user-data", "web", { data, session }, e));
            return {
                success: false,
                message: "Ein Fehler beim Ändern ihrer Daten ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-user-data", "web", { data, session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Daten zu ändern.",
            };
        }
        waitUntil(logError("profile/error", "update-user-data", "web", { data, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
}

export async function updateUserGoals(data: z.infer<typeof userGoalSchema>) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;

        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "update-user-goals", "web", data));
            throw new UserNotLoggedInError();
        }

        if (await isDemoUser()) {
            updateUserDataCookieStore(cookies(), {
                user_data: {
                    timestamp: new Date(),
                    consumptionGoal: data.goalValue,
                },
            } as Partial<UserDataType>);
            waitUntil(trackAction("user/update-goals-demo", "update-user-goals", "web", { data, session }));
            revalidateUserDataPaths();
            return;
        }

        const dbuser = await getUserById(session.userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "update-user-goals", "web", data));
            throw new UserNotFoundError();
        }

        try {
            await updateUserData(
                {
                    timestamp: new Date(),
                    consumptionGoal: data.goalValue,
                },
                session.userId,
            );
            waitUntil(trackAction("user/updated-goals", "update-user-goals", "web", { data, session }));
            revalidateUserDataPaths();
        } catch (e) {
            waitUntil(logError("user/error-updating-goals", "update-user-goals", "web", { data, session }, e));
            return {
                success: false,
                message: "Ein Fehler beim Speichern Ihrer Ziele ist aufgetreten.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-user-goals", "web", {}, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihre Ziele zu aktualisieren.",
            };
        }
        waitUntil(logError("profile/error", "update-user-goals", "web", {}, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten",
        };
    }
}

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
    let session: Session | null = null;
    try {
        session = (await getActionSession())?.session;
        if (!session) {
            waitUntil(log("user/not-logged-in", "error", "delete-account", "web", data));
            throw new UserNotLoggedInError();
        }

        const userId = session.userId;
        const dbuser = await getUserById(userId);
        if (!dbuser) {
            waitUntil(log("user/not-found", "error", "delete-account", "web", { session, userId }));
            throw new UserNotFoundError();
        }

        let match = false;
        try {
            match = await new Argon2id().verify(dbuser.password, data.password);
        } catch (err) {
            try {
                match = await new Bcrypt().verify(dbuser.password, data.password);
            } catch (err) {
                waitUntil(log("user/password-not-match", "error", "delete-account", "web", { session, err }));
            }
        }
        if (!match) {
            waitUntil(log("user/password-not-match", "error", "delete-account", "web", { session, userId }));
            throw new PasswordsDoNotMatchError();
        }

        try {
            await deleteUser(session.userId);
            await deleteSessionsOfUser(userId);
            cookies().delete(lucia.sessionCookieName);
            waitUntil(trackAction("user/deleted-account", "delete-account", "web", { session, userId: userId }));
        } catch (e) {
            waitUntil(logError("user/error-deleting", "delete-account", "web", { session }, e));
            return {
                success: false,
                message: "Ein Fehler beim löschen Ihrers Accounts ist aufgetreten.",
            };
        }
    } catch (err) {
        waitUntil(logError("user/error", "delete-account", "web", {}, err));
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um Ihren Account zu löschen.",
            };
        }

        if (err instanceof PasswordsDoNotMatchError) {
            return {
                success: false,
                message: "Das von Ihnen eingegebene Passwort stimmt nicht mit dem Passwort Ihres Accounts überein.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten",
        };
    }
    redirect("/");
}

function revalidateUserDataPaths() {
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
}
