"use server";

import { env, getUrl } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import { getUserDataCookieStoreDefaults, isDemoUser, setDemoPeaks } from "@/lib/demo/demo";
import type { forgotSchema, resetSchema } from "@/lib/schema/auth";
import { buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import {
    sendAccountCreatedEmail,
    sendAdminNewAccountCreatedEmail,
    sendPasswordChangedEmail,
    sendPasswordResetEmail,
} from "@energyleaf/mail";
import { logError, trackAction } from "@energyleaf/postgres/query/logs";
import { updateMailSettings as updateMailSettingsDb } from "@energyleaf/postgres/query/mail";
import {
    type CreateUserType,
    createUser,
    getUserById,
    getUserByMail,
    updatePassword,
} from "@energyleaf/postgres/query/user";
import { type UserSelectType, userDataElectricityMeterTypeEnums } from "@energyleaf/postgres/types";
import { put } from "@energyleaf/storage";
import * as jose from "jose";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id, Bcrypt } from "oslo/password";
import "server-only";
import type { mailSettingsSchema } from "@/lib/schema/profile";
import type { userDataTable } from "@energyleaf/postgres/schema/user";
import { waitUntil } from "@vercel/functions";
import type { z } from "zod";

/**
 * Server action for creating a new account
 */
export async function createAccount(data: FormData) {
    const phone = data.get("phone") as string | undefined;
    const firstname = data.get("firstname") as string;
    const lastname = data.get("lastname") as string;
    const address = data.get("address") as string;
    const comment = data.get("comment") as string | undefined;
    const mail = data.get("mail") as string;
    const hasWifi = (data.get("hasWifi") as string) === "true";
    const hasPower = (data.get("hasPower") as string) === "true";
    const password = data.get("password") as string;
    const passwordRepeat = data.get("passwordRepeat") as string;
    const username = data.get("username") as string;
    const file = data.get("file") as File;
    const tos = (data.get("tos") as string) === "true";
    const pin = (data.get("pin") as string) === "true";
    const electricityMeterType = data.get(
        "electricityMeterType",
    ) as (typeof userDataTable.electricityMeterType.enumValues)[number];
    const electricityMeterNumber = data.get("electricityMeterNumber") as string;
    const participation = (data.get("participation") as string) === "true";

    if (!tos) {
        waitUntil(trackAction("privacy-policy/not-accepted", "create-account", "web", { mail }));
        return {
            success: false,
            message: "Sie müssen den Datenschutzbestimmungen zustimmen.",
        };
    }

    if (file && !file.type.startsWith("image/")) {
        waitUntil(trackAction("image-upload/wrong-format", "create-account", "web", { mail, fileType: file.type }));
        return {
            success: false,
            message: "Bitte laden Sie ein Bild hoch.",
        };
    }

    if (!pin) {
        waitUntil(trackAction("smart-meter-pin/not-accepted", "create-account", "web", { mail }));
        return {
            success: false,
            message: "Sie müssen der PIN-Beantragung zustimmen...",
        };
    }

    if (mail === "demo@energyleaf.de") {
        waitUntil(trackAction("user-mail/demo-account", "create-account", "web", { mail }));
        return {
            success: false,
            message: "Demo-Account kann nicht erstellt werden.",
        };
    }

    if (password !== passwordRepeat) {
        waitUntil(trackAction("user-passwords/not-matching", "create-account", "web", { mail }));
        return {
            success: false,
            message: "Passwörter stimmen nicht überein.",
        };
    }

    if (mail.length >= 256) {
        waitUntil(trackAction("user-mail/too-long", "create-account", "web", { mail }));
        return {
            success: false,
            message: "E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.",
        };
    }
    if (username.length >= 30) {
        waitUntil(trackAction("user-username/too-long", "create-account", "web", { mail, username }));
        return {
            success: false,
            message: "Benutzername muss unter dem Zeichenlimit von 30 Zeichen liegen.",
        };
    }
    if (password.length >= 256) {
        waitUntil(trackAction("user-password/too-long", "create-account", "web", { mail }));
        return {
            success: false,
            message: "Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.",
        };
    }

    const user = await getUserByMail(mail);
    if (user) {
        waitUntil(trackAction("user-mail/already-used", "create-account", "web", { mail, userId: user.id }));
        return {
            success: false,
            message: "E-Mail wird bereits verwendet.",
        };
    }

    const hash = await new Argon2id().hash(password);

    let url: string | undefined = undefined;
    if (
        env.AWS_ENDPOINT_URL_S3 &&
        env.AWS_SECRET_ACCESS_KEY &&
        env.AWS_ACCESS_KEY_ID &&
        env.BUCKET_NAME &&
        env.AWS_REGION &&
        env.FILE_URL
    ) {
        try {
            const res = await put({
                keyId: env.AWS_ACCESS_KEY_ID,
                secret: env.AWS_SECRET_ACCESS_KEY,
                region: env.AWS_REGION,
                endpoint: env.AWS_ENDPOINT_URL_S3,
                bucket: env.BUCKET_NAME,
                path: "electricitiy_meter",
                body: file,
            });
            url = `${env.FILE_URL}/${res.key}`;
        } catch (err) {
            await logError("electricity-meter/error-uploading-image", "create-account", "web", { mail }, err);
        }
    }

    try {
        await createUser({
            firstname,
            address,
            lastname,
            phone: phone,
            comment: comment,
            hasPower,
            hasWifi,
            email: mail,
            password: hash,
            username,
            electricityMeterType,
            meterImgUrl: url,
            electricityMeterNumber,
            participation,
        } satisfies CreateUserType);
        waitUntil(trackAction("user-account/created", "create-account", "web", { mail }));
        if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
            await sendAccountCreatedEmail({
                to: mail,
                name: `${firstname} ${lastname}`,
                apiKey: env.RESEND_API_KEY,
                from: env.RESEND_API_MAIL,
            });
            waitUntil(trackAction("account-created-mail/sent", "create-account", "web", { mail }));
            if (env.ADMIN_MAIL) {
                await sendAdminNewAccountCreatedEmail({
                    email: mail,
                    name: username,
                    meter: userDataElectricityMeterTypeEnums[electricityMeterType],
                    meterNumber: electricityMeterNumber,
                    hasWifi,
                    hasPower,
                    participates: participation,
                    to: env.ADMIN_MAIL,
                    from: env.RESEND_API_MAIL,
                    apiKey: env.RESEND_API_KEY,
                });
                waitUntil(
                    trackAction("admin-new-account-created-mail/sent", "create-account", "web", { mail, username }),
                );
            }
        }
    } catch (err) {
        waitUntil(logError("error-creating-user", "create-account", "web", { mail }, err));
        return {
            success: false,
            message: "Fehler beim Erstellen des Accounts.",
        };
    }
    redirect("/created");
}

export async function forgotPassword(data: z.infer<typeof forgotSchema>) {
    const { mail } = data;

    if (mail === "demo@energyleaf.de") {
        waitUntil(trackAction("user-mail/demo-account", "forgot-password", "web", { mail }));
        return {
            success: false,
            message: "Demo-Account kann nicht zurückgesetzt werden.",
        };
    }

    const user = await getUserByMail(mail);
    if (!user) {
        waitUntil(trackAction("user-mail/not-found", "forgot-password", "web", { mail }));
        return {
            success: false,
            message: "E-Mail wird nicht verwendet.",
        };
    }

    const token = await getResetPasswordToken({ userId: user.id, secret: env.HASH_SECRET });
    const resetUrl = buildResetPasswordUrl({ baseUrl: getUrl(env), token });

    try {
        if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
            await sendPasswordResetEmail({
                from: env.RESEND_API_MAIL,
                to: mail,
                name: user.username,
                link: resetUrl,
                apiKey: env.RESEND_API_KEY,
            });
            waitUntil(
                trackAction("reset-mail/sent", "forgot-password", "web", { mail, userId: user.id, token, resetUrl }),
            );
        }
    } catch (err) {
        console.error(err);
        waitUntil(
            logError(
                "reset-mail/error-sending",
                "forgot-password",
                "web",
                { mail, userId: user.id, token, resetUrl },
                err,
            ),
        );
        return {
            success: false,
            message: "Fehler beim Senden der E-Mail.",
        };
    }
}

export async function resetPassword(data: z.infer<typeof resetSchema>, resetToken: string) {
    const { password: newPassword, passwordRepeat } = data;

    if (newPassword !== passwordRepeat) {
        waitUntil(trackAction("user-passwords/not-matching", "reset-password", "web", { resetToken }));
        return {
            success: false,
            message: "Passwörter stimmen nicht überein.",
        };
    }

    const { sub } = jose.decodeJwt(resetToken);
    if (!sub) {
        waitUntil(trackAction("reset-token/invalid", "reset-password", "web", { resetToken }));
        return {
            success: false,
            message: "Ungültiges oder abgelaufenes Passwort-Reset-Token",
        };
    }

    const user = await getUserById(sub);

    if (!user) {
        waitUntil(trackAction("user-id/not-found", "reset-password", "web", { resetToken, userId: sub }));
        return {
            success: false,
            message: "Ungültiges oder abgelaufenes Passwort-Reset-Token",
        };
    }

    try {
        await jose.jwtVerify(resetToken, Buffer.from(env.HASH_SECRET, "hex"), {
            audience: "energyleaf",
            issuer: "energyleaf",
            algorithms: ["HS256"],
        });
    } catch (err) {
        waitUntil(logError("reset-token/error-verifying", "reset-password", "web", { resetToken, userId: sub }, err));
        return {
            success: false,
            message: "Fehler beim Verifizieren des Tokens.",
        };
    }

    try {
        const hash = await new Argon2id().hash(newPassword);
        await updatePassword({ password: hash }, user.id);
        waitUntil(trackAction("password-changed", "reset-password", "web", { resetToken, userId: sub }));
    } catch (err) {
        waitUntil(logError("updating-password", "reset-password", "web", { resetToken, userId: sub }, err));
        return {
            success: false,
            message: "Fehler beim Ändern des Passworts.",
        };
    }

    try {
        if (env.RESEND_API_KEY && env.RESEND_API_MAIL) {
            await sendPasswordChangedEmail({
                from: env.RESEND_API_MAIL,
                to: user.email,
                name: user.username,
                apiKey: env.RESEND_API_KEY,
            });
            waitUntil(trackAction("password-changed-mail/sent", "reset-password", "web", { resetToken, userId: sub }));
        }
    } catch (err) {
        waitUntil(
            logError("password-changed-mail/error-sending", "reset-password", "web", { resetToken, userId: sub }, err),
        );
        return {
            success: false,
            message: "Fehler beim Senden der E-Mail.",
        };
    }
}

/**
 * Server action to sign a user in
 */
export async function signInAction(email: string, password: string, next?: string) {
    const { session } = await getActionSession();
    if (session) {
        await handleSignIn(session, null, next);
    }

    const user = await getUserByMail(email);
    if (!user) {
        waitUntil(trackAction("user-mail/not-found", "sign-in", "web", { email }));
        return {
            success: false,
            message: "E-Mail oder Passwort falsch.",
        };
    }

    if (!user.isActive) {
        waitUntil(trackAction("user-not-active", "sign-in", "web", { email, userId: user.id }));
        redirect("/created");
    }

    let match: boolean;

    try {
        match = await new Argon2id().verify(user.password, password);
    } catch (err) {
        waitUntil(logError("verifying-password", "sign-in", "web", { email, userId: user.id }, err));
        match = await new Bcrypt().verify(user.password, password);
        if (!match) {
            waitUntil(trackAction("password-verification-error", "sign-in", "web", { email, userId: user.id }));
            return {
                success: false,
                message: "E-Mail oder Passwort falsch.",
            };
        }

        try {
            const hash = await new Argon2id().hash(password);
            await updatePassword({ password: hash }, user.id);
        } catch (err) {
            waitUntil(logError("updating-password", "sign-in", "web", { email, userId: user.id }, err));
            return {
                success: false,
                message: "Ein Fehler ist aufgetreten.",
            };
        }
    }

    if (!match) {
        waitUntil(trackAction("password-verification-error", "sign-in", "web", { email, userId: user.id }));
        return {
            success: false,
            message: "E-Mail oder Passwort falsch.",
        };
    }

    const newSession = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(newSession.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    await handleSignIn(newSession, user, next);
    waitUntil(trackAction("user-signed-in", "sign-in", "web", { email, userId: user.id }));
}

async function handleSignIn(session: Session, user: UserSelectType | null, next?: string) {
    let userData = user;
    if (!userData) {
        userData = await getUserById(session.userId);
    }
    const onboardingCompleted = userData?.onboardingCompleted ?? false;

    if (!onboardingCompleted) {
        redirect("/onboarding");
    }

    if (next) {
        redirect(next);
    } else {
        redirect("/dashboard");
    }
}

/**
 * Server action to sign a user in as demo
 */
export async function signInDemoAction() {
    const { session } = await getActionSession();
    if (session) {
        redirect("/dashboard");
    }

    const cookieStore = cookies();

    await setDemoPeaks(cookieStore);
    cookieStore.set("demo_mode", "true");
    cookieStore.set("demo_data", JSON.stringify(getUserDataCookieStoreDefaults()));
    waitUntil(trackAction("demo-user-signed-in", "sign-in-demo", "web", {}));
    redirect("/dashboard");
}

/**
 * Server action to sign a user out
 */
export async function signOutAction() {
    const { session } = await getActionSession();
    if (!session) {
        return;
    }

    await lucia.invalidateSession(session.id);
    cookies().delete("auth_session");
    await trackAction("user-signed-out", "sign-out", "web", { userId: session.userId });
    redirect("/");
}

export async function signOutDemoAction() {
    if (!(await isDemoUser())) {
        await logError("not-demo-user", "sign-out-demo", "web", {}, new Error("Not a demo user"));
        throw new Error("Not a demo user");
    }
    const cookieStore = cookies();
    cookieStore.delete("demo_data");
    cookieStore.delete("demo_devices");
    cookieStore.delete("demo_peaks");
    cookieStore.delete("demo_mode");
    waitUntil(trackAction("demo-user-signed-out", "sign-out-demo", "web", {}));
    redirect("/");
}

export async function updateMailSettings(data: z.infer<typeof mailSettingsSchema>, userId: string | null) {
    let id = userId;
    const { user, session } = await getActionSession();
    if (!id) {
        if (!user) {
            waitUntil(trackAction("user/not-logged-in", "update-reports-config", "web", { data, session }));
            return {
                success: false,
                message: "Nicht eingeloggt.",
            };
        }

        id = user.id;
    }

    const dbUser = await getUserById(id);
    if (!dbUser) {
        waitUntil(trackAction("user/not-found-in-db", "update-reports-config", "web", { data, session }));
        return {
            success: false,
            message: "Nutzer nicht gefunden.",
        };
    }

    try {
        waitUntil(trackAction("reports-config-updated", "update-reports-config", "web", { data, session }));
        await updateMailSettingsDb(
            {
                reportConfig: {
                    receiveMails: data.receiveReportMails,
                    interval: data.interval,
                    time: data.time,
                },
                anomalyConfig: {
                    receiveMails: data.receiveAnomalyMails,
                },
            },
            id,
        );
    } catch (e) {
        waitUntil(logError("reports-config-update-error", "update-reports-config", "web", { data, session }, e));
        return {
            success: false,
            message: "Fehler beim Speichern der Einstellungen.",
        };
    }
}
