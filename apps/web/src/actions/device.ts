"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { deviceSchema } from "@/lib/schema/device";
import {
    createDevice as createDeviceDb,
    deleteDevice as deleteDeviceDb,
    getUserById,
    logError,
    trackAction,
    updateDevice as updateDeviceDb,
} from "@energyleaf/db/query";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import type { z } from "zod";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    let session: Session | undefined = undefined;
    try {
        session = (await getActionSession())?.session as Session;

        if (!session) {
            throw new UserNotLoggedInError();
        }

        const id = session.userId;
        const dbuser = await getUserById(id);
        if (!dbuser) {
            throw new UserNotFoundError();
        }

        try {
            await createDeviceDb({
                name: data.deviceName,
                userId: session.userId,
                category: data.category,
            });
            waitUntil(trackAction("device/create", "create-device", "web", { data, session }));
        } catch (error) {
            waitUntil(logError("device/not-created", "create-device", "web", { data, session }, error));
            return {
                success: false,
                message: "Fehler beim Erstellen des Gerätes.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotFoundError) {
            waitUntil(logError("user/not-found", "create-device", "web", { data, session }, err));
            return {
                success: false,
                message: "Das Gerät konnte nicht gespeichert werden.",
            };
        }

        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "create-device", "web", { data, session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu ändern.",
            };
        }

        waitUntil(logError("device/error-creating", "create-device", "web", { data, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}

export async function updateDevice(data: z.infer<typeof deviceSchema>, deviceId: number) {
    let session: Session | undefined = undefined;
    try {
        session = (await getActionSession())?.session as Session;

        if (!session) {
            throw new UserNotLoggedInError();
        }

        const userId = session.userId;
        const dbuser = await getUserById(userId);
        if (!dbuser) {
            throw new UserNotFoundError();
        }

        try {
            await updateDeviceDb(deviceId, {
                name: data.deviceName,
                userId: userId,
                category: data.category,
            });
            waitUntil(trackAction("device/update", "update-device", "web", { data, deviceId, session }));
        } catch (error) {
            waitUntil(logError("device/error-updating", "update-device", "web", { data, deviceId, session }, error));
            return {
                success: false,
                message: "Fehler beim Speichern des Gerätes.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotFoundError) {
            waitUntil(logError("user/not-found", "update-device", "web", { data, deviceId, session }, err));
            return {
                success: false,
                message: "Es konnte kein Gerät erstellt werden.",
            };
        }

        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "update-device", "web", { data, deviceId, session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu erstellen.",
            };
        }
        waitUntil(logError("device/error-updating", "update-device", "web", { data, deviceId, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}

export async function deleteDevice(deviceId: number) {
    let session: Session | undefined = undefined;
    try {
        session = (await getActionSession())?.session as Session;

        if (!session) {
            throw new UserNotLoggedInError();
        }

        const userId = session.userId;
        try {
            await deleteDeviceDb(deviceId, userId);
            waitUntil(trackAction("device/delete", "delete-device", "web", { deviceId, session }));
        } catch (error) {
            waitUntil(logError("device/error-deleting", "delete-device", "web", { deviceId, session }, error));
            return {
                success: false,
                message: "Fehler beim Löschen des Geräts",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            waitUntil(logError("user/not-logged-in", "delete-device", "web", { deviceId, session }, err));
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu löschen.",
            };
        }
        waitUntil(logError("device/error-deleting", "delete-device", "web", { deviceId, session }, err));
        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}
