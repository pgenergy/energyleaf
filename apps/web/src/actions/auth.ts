"use server";

import { env, getUrl } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { lucia } from "@/lib/auth/auth.config";
import { getUserDataCookieStore, isDemoUser } from "@/lib/demo/demo";
import type { forgotSchema, resetSchema } from "@/lib/schema/auth";
import { genId } from "@energyleaf/db";
import {
    type CreateUserType,
    createUser,
    getUserById,
    getUserByMail,
    logError,
    trackAction,
    updatePassword,
    updateReportConfig,
} from "@energyleaf/db/query";
import { type UserSelectType, userDataElectricityMeterTypeEnums } from "@energyleaf/db/types";
import { buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
import {
    sendAccountCreatedEmail,
    sendAdminNewAccountCreatedEmail,
    sendPasswordChangedEmail,
    sendPasswordResetEmail,
} from "@energyleaf/mail";
import { put } from "@vercel/blob";
import * as jose from "jose";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id, Bcrypt } from "oslo/password";
import "server-only";
import type { reportSettingsSchema } from "@/lib/schema/profile";
import type { userData } from "@energyleaf/db/schema";
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
    ) as (typeof userData.electricityMeterType.enumValues)[number];
    const electricityMeterNumber = data.get("electricityMeterNumber") as string;
    const participation = (data.get("participation") as string) === "true";
    const prolific = (data.get("prolific") as string) === "true";

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
    if (env.BLOB_READ_WRITE_TOKEN) {
        try {
            const imageMimeToExtensionMap = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/gif": "gif",
                "image/bmp": "bmp",
                "image/webp": "webp",
                "image/tiff": "tiff",
                "image/svg+xml": "svg",
                "image/heic": "heic",
                "image/heif": "heif",
            };
            const id = genId(25);
            const type = file.type;
            const ext = imageMimeToExtensionMap[type] || type.split("/")[1];
            const res = await put(`electricitiy_meter/${id}.${ext}`, file, {
                access: "public",
                contentType: type,
            });
            url = res.url;
        } catch (err) {
            await logError("electricity-meter/error-uploading-image", "create-account", "web", { mail }, err);
        }
    }

    try {
        await createUser({
            firstname,
            address,
            lastname,
            phone,
            comment,
            hasPower,
            hasWifi,
            email: mail,
            password: hash,
            username,
            electricityMeterType,
            meterImgUrl: url,
            electricityMeterNumber,
            participation,
            prolific,
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
                    prolific,
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
export async function signInAction(email: string, password: string) {
    const { session } = await getActionSession();
    if (session) {
        await handleSignIn(session, null);
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
    await handleSignIn(newSession, user);
    waitUntil(trackAction("user-signed-in", "sign-in", "web", { email, userId: user.id }));
}

async function handleSignIn(session: Session, user: UserSelectType | null) {
    let userData = user;
    if (!userData) {
        userData = await getUserById(session.userId);
    }
    const onboardingCompleted = userData?.onboardingCompleted ?? false;

    if (!onboardingCompleted) {
        redirect("/onboarding");
    }

    redirect("/dashboard");
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

    cookieStore.set("demo_mode", "true");
    cookieStore.set("demo_data", JSON.stringify(getUserDataCookieStore()));
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

export async function updateReportConfigSettings(data: z.infer<typeof reportSettingsSchema>, userId: string | null) {
    let id = userId;
    const { user, session } = await getActionSession();
    if (!id) {
        if (!user) {
            waitUntil(trackAction("user/not-logged-in", "update-report-config", "web", { data, session }));
            return {
                success: false,
                message: "Nicht eingeloggt.",
            };
        }

        id = user.id;
    }

    const dbUser = await getUserById(id);
    if (!dbUser) {
        waitUntil(trackAction("user/not-found-in-db", "update-report-config", "web", { data, session }));
        return {
            success: false,
            message: "Nutzer nicht gefunden.",
        };
    }

    try {
        waitUntil(trackAction("report-config-updated", "update-report-config", "web", { data, session }));
        await updateReportConfig(
            {
                receiveMails: data.receiveMails,
                interval: data.interval,
                time: data.time,
            },
            id,
        );
    } catch (e) {
        waitUntil(logError("report-config-update-error", "update-report-config", "web", { data, session }, e));
        return {
            success: false,
            message: "Fehler beim Speichern der Einstellungen.",
        };
    }
}
