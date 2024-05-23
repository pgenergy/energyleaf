"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { deviceSchema } from "@/lib/schema/device";
import {
    createDevice as createDeviceDb,
    deleteDevice as deleteDeviceDb,
    getUserById,
    updateDevice as updateDeviceDb,
} from "@energyleaf/db/query";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    try {
        const { user, session } = await getActionSession();
        if (!session) {
            throw new UserNotLoggedInError();
        }

        const id = user.id;
        const dbuser = await getUserById(id);
        if (!dbuser) {
            throw new UserNotFoundError();
        }

        try {
            await createDeviceDb({
                name: data.deviceName,
                userId: user.id,
                category: data.category,
            });
        } catch (error: unknown) {
            return {
                success: false,
                message: "Fehler beim Erstellen des Gerätes.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotFoundError) {
            return {
                success: false,
                message: "Das Gerät konnte nicht gespeichert werden.",
            };
        }

        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu ändern.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}

export async function updateDevice(data: z.infer<typeof deviceSchema>, deviceId: number) {
    try {
        const { user, session } = await getActionSession();
        if (!session) {
            throw new UserNotLoggedInError();
        }

        const userId = user.id;
        const dbuser = await getUserById(userId);
        if (!dbuser) {
            throw new UserNotFoundError();
        }

        try {
            await updateDeviceDb(deviceId, {
                name: data.deviceName,
                userId: user.id,
                category: data.category,
            });
        } catch (error: unknown) {
            return {
                success: false,
                message: "Fehler beim Speichern des Gerätes.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotFoundError) {
            return {
                success: false,
                message: "Es konnte kein Gerät erstellt werden.",
            };
        }

        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu erstellen.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}

export async function deleteDevice(deviceId: number) {
    try {
        const { user, session } = await getActionSession();
        if (!session) {
            throw new UserNotLoggedInError();
        }

        const userId = user.id;
        try {
            await deleteDeviceDb(deviceId, userId);
        } catch (error) {
            return {
                success: false,
                message: "Fehler beim Löschen des Geräts",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein, um ein Gerät zu löschen.",
            };
        }

        return {
            success: false,
            message: "Ein Fehler ist aufgetreten.",
        };
    }
    revalidatePath("/devices");
}
