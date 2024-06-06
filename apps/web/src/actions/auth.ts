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
    updatePassword,
    updateReportConfig,
} from "@energyleaf/db/query";
import type { userData } from "@energyleaf/db/schema";
import { type UserSelectType, userDataElectricityMeterTypeEnums } from "@energyleaf/db/types";
import { UserNotFoundError, UserNotLoggedInError, buildResetPasswordUrl, getResetPasswordToken } from "@energyleaf/lib";
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
    const file = data.get("file") as File | undefined;
    const tos = (data.get("tos") as string) === "true";
    const electricityMeterType = data.get(
        "electricityMeterType",
    ) as (typeof userData.electricityMeterType.enumValues)[number];

    if (!tos) {
        return {
            success: false,
            message: "Sie müssen den Datenschutzbestimmungen zustimmen.",
        };
    }

    if (mail === "demo@energyleaf.de") {
        return {
            success: false,
            message: "Demo-Account kann nicht erstellt werden.",
        };
    }

    if (password !== passwordRepeat) {
        return {
            success: false,
            message: "Passwörter stimmen nicht überein.",
        };
    }

    if (mail.length >= 256) {
        return {
            success: false,
            message: "E-Mail muss unter dem Zeichenlimit von 256 Zeichen liegen.",
        };
    }
    if (username.length >= 30) {
        return {
            success: false,
            message: "Benutzername muss unter dem Zeichenlimit von 30 Zeichen liegen.",
        };
    }
    if (password.length >= 256) {
        return {
            success: false,
            message: "Passwort muss unter dem Zeichenlimit von 256 Zeichen liegen.",
        };
    }

    const user = await getUserByMail(mail);
    if (user) {
        return {
            success: false,
            message: "E-Mail wird bereits verwendet.",
        };
    }

    const hash = await new Argon2id().hash(password);

    let url: string | undefined = undefined;
    if (file && env.BLOB_READ_WRITE_TOKEN) {
        try {
            const id = genId(25);
            const type = file.name.split(".").pop();
            const res = await put(`electricitiy_meter/${id}.${type}`, file, {
                access: "public",
            });
            url = res.url;
        } catch (err) {
            console.error(err);
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
        } satisfies CreateUserType);
        await sendAccountCreatedEmail({
            to: mail,
            name: `${firstname} ${lastname}`,
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_API_MAIL,
        });
        await sendAdminNewAccountCreatedEmail({
            email: mail,
            name: username,
            meter: userDataElectricityMeterTypeEnums[electricityMeterType],
            img: url,
            to: env.ADMIN_MAIL,
            from: env.RESEND_API_MAIL,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        console.error(err);
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
        return {
            success: false,
            message: "Demo-Account kann nicht zurückgesetzt werden.",
        };
    }

    const user = await getUserByMail(mail);
    if (!user) {
        return {
            success: false,
            message: "E-Mail wird nicht verwendet.",
        };
    }

    const token = await getResetPasswordToken({ userId: user.id, secret: env.NEXTAUTH_SECRET });
    const resetUrl = buildResetPasswordUrl({ baseUrl: getUrl(env), token });

    try {
        await sendPasswordResetEmail({
            from: env.RESEND_API_MAIL,
            to: mail,
            name: user.username,
            link: resetUrl,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "Fehler beim Senden der E-Mail.",
        };
    }
}

export async function resetPassword(data: z.infer<typeof resetSchema>, resetToken: string) {
    const { password: newPassword, passwordRepeat } = data;

    if (newPassword !== passwordRepeat) {
        return {
            success: false,
            message: "Passwörter stimmen nicht überein.",
        };
    }

    const { sub } = jose.decodeJwt(resetToken);
    if (!sub) {
        return {
            success: false,
            message: "Ungültiges oder abgelaufenes Passwort-Reset-Token",
        };
    }

    const user = await getUserById(sub);

    if (!user) {
        return {
            success: false,
            message: "Ungültiges oder abgelaufenes Passwort-Reset-Token",
        };
    }

    try {
        await jose.jwtVerify(resetToken, Buffer.from(env.NEXTAUTH_SECRET, "hex"), {
            audience: "energyleaf",
            issuer: "energyleaf",
            algorithms: ["HS256"],
        });
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "Fehler beim Verifizieren des Tokens.",
        };
    }

    try {
        const hash = await new Argon2id().hash(newPassword);
        await updatePassword({ password: hash }, user.id);
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: "Fehler beim Ändern des Passworts.",
        };
    }

    try {
        await sendPasswordChangedEmail({
            from: env.RESEND_API_MAIL,
            to: user.email,
            name: user.username,
            apiKey: env.RESEND_API_KEY,
        });
    } catch (err) {
        console.error(err);
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
        return {
            success: false,
            message: "E-Mail oder Passwort falsch.",
        };
    }

    if (!user.isActive) {
        redirect("/created");
    }

    let match = false;

    try {
        match = await new Argon2id().verify(user.password, password);
    } catch (err) {
        match = await new Bcrypt().verify(user.password, password);
        if (!match) {
            return {
                success: false,
                message: "E-Mail oder Passwort falsch.",
            };
        }

        try {
            const hash = await new Argon2id().hash(password);
            await updatePassword({ password: hash }, user.id);
        } catch (err) {
            console.error(err);
            return {
                success: false,
                message: "Ein Fehler ist aufgetreten.",
            };
        }
    }

    if (!match) {
        return {
            success: false,
            message: "E-Mail oder Passwort falsch.",
        };
    }

    const newSession = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(newSession.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    await handleSignIn(newSession, user);
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
    redirect("/");
}

export async function signOutDemoAction() {
    if (!(await isDemoUser())) {
        throw new Error("Not a demo user");
    }
    const cookieStore = cookies();
    cookieStore.delete("demo_data");
    cookieStore.delete("demo_devices");
    cookieStore.delete("demo_peaks");
    cookieStore.delete("demo_mode");
    redirect("/");
}

export async function updateReportConfigSettings(data: z.infer<typeof reportSettingsSchema>, userId: string | null) {
    let id = userId;
    if (!id) {
        const { user } = await getActionSession();

        if (!user) {
            throw new UserNotLoggedInError();
        }

        id = user.id;
    }

    const dbUser = await getUserById(id);
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
            id,
        );
    } catch (e) {
        console.log(e);
        throw new Error(`Error while updating user: ${e}`);
    }
}
