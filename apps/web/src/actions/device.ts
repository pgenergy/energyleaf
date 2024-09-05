"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { deviceSchema } from "@/lib/schema/device";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import {
    createDevice as createDeviceDb,
    deleteDevice as deleteDeviceDb,
    updateDevice as updateDeviceDb,
} from "@energyleaf/postgres/query/device";
import { log, logError, trackAction } from "@energyleaf/postgres/query/logs";
import { getUserById } from "@energyleaf/postgres/query/user";
import { revalidatePath } from "next/cache";
import "server-only";
import {
    addOrUpdateDemoDeviceToCookieStore,
    deleteDemoDeviceFromCookieStore,
    getDemoDevicesCookieStore,
} from "@/lib/demo/demo";
import { waitUntil } from "@vercel/functions";
import type { Session } from "lucia";
import { cookies } from "next/headers";
import type { z } from "zod";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    let session: Session | null = null;
    try {
        const { user, session: actionSession } = await getActionSession();
        session = actionSession;
        if (!session || !user) {
            waitUntil(log("user/not-logged-in", "error", "create-device", "web", { data }));
            throw new UserNotLoggedInError();
        }

        const id = session.userId;

        // handle demo user
        if (user.id === "demo") {
            const currentDevices = getDemoDevicesCookieStore(cookies());
            const newId = currentDevices.length + 1;
            addOrUpdateDemoDeviceToCookieStore(cookies(), {
                id: newId,
                name: data.deviceName,
                category: data.category,
                created: new Date(),
                timestamp: new Date(),
                userId: "demo",
                power: null,
                isPowerEstimated: true,
                weeklyUsageEstimation: null,
            });
            revalidatePath("/devices");
            return;
        }

        const dbUser = await getUserById(id);
        if (!dbUser) {
            waitUntil(log("user/not-found", "error", "create-device", "web", { data, session }));
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
    let session: Session | null = null;
    try {
        const { user, session: actionSession } = await getActionSession();
        session = actionSession;

        if (!session || !user) {
            waitUntil(log("user/not-logged-in", "error", "update-device", "web", { data }));
            throw new UserNotLoggedInError();
        }

        const userId = session.userId;

        // handle demo user
        if (user.id === "demo") {
            const currentDevices = getDemoDevicesCookieStore(cookies());
            const device = currentDevices.find((d) => d.id === deviceId);
            if (!device) {
                return {
                    success: false,
                    message: "Fehler beim Speichern des Gerätes.",
                };
            }
            addOrUpdateDemoDeviceToCookieStore(cookies(), {
                ...device,
                name: data.deviceName,
                category: data.category,
            });
            revalidatePath("/devices");
            return;
        }

        const dbUser = await getUserById(userId);
        if (!dbUser) {
            waitUntil(log("user/not-found", "error", "update-device", "web", { data, deviceId, session }));
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
    let session: Session | null = null;
    try {
        const { user, session: actionSession } = await getActionSession();
        session = actionSession;

        if (!session || !user) {
            waitUntil(log("user/not-logged-in", "error", "delete-device", "web", { deviceId }));
            throw new UserNotLoggedInError();
        }

        const userId = session.userId;

        // handle demo user
        if (user.id === "demo") {
            const currentDevices = getDemoDevicesCookieStore(cookies());
            const device = currentDevices.find((d) => d.id === deviceId);
            if (!device) {
                return {
                    success: false,
                    message: "Fehler beim Löschen des Geräts",
                };
            }
            deleteDemoDeviceFromCookieStore(cookies(), deviceId);
            revalidatePath("/devices");
            return;
        }

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
