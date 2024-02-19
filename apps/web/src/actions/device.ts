"use server";

import { DeviceCategory } from "@/lib/schema/device";
import type { deviceSchema } from "@/lib/schema/device";
import { getSession } from "@/lib/auth/auth";
import { createDevice as createDeviceDb, updateDevice as updateDeviceDb, deleteDevice as deleteDeviceDb } from "@energyleaf/db/query";
import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserNotLoggedInError, UserNotFoundError } from "@energyleaf/lib/errors/auth";
import { getUserById } from "@energyleaf/db/query";
import "server-only";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }
    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
    }

    const categoryKey = Object.keys(DeviceCategory).find(key => DeviceCategory[key as keyof typeof DeviceCategory] === data.category);
    if (!categoryKey) {
        throw new Error(`Ungültige Kategorie: ${data.category}`);
    }

    try {
        await createDeviceDb({
            name: data.deviceName,
            userId: user.id,
            category: categoryKey,
        });
        revalidatePath("/devices");
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Fehler beim Erstellen des Geräts`);
        }
    }
}

export async function updateDevice(data: z.infer<typeof deviceSchema>, deviceId: number) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }
    const user = await getUserById(Number(session.user.id));
    if (!user) {
        throw new UserNotFoundError();
    }

    const categoryKey = Object.keys(DeviceCategory).find(key => DeviceCategory[key as keyof typeof DeviceCategory] === data.category);
    if (!categoryKey) {
        throw new Error(`Ungültige Kategorie: ${data.category}`);
    }

    try {
        await updateDeviceDb(deviceId, {
            name: data.deviceName,
            userId: user.id,
            category: categoryKey,
        });
        revalidatePath("/devices");
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error("Fehler beim Aktualisieren des Geräts");
        }
    }
}

export async function deleteDevice(deviceId: number) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    try {
        await deleteDeviceDb(deviceId, Number(session.user.id));
        revalidatePath("/devices");
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error("Fehler beim Löschen des Geräts");
        }
    }
}

