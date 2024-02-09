"use server";

import { getSession } from "@/lib/auth/auth";
import { createDevice as createDeviceDb, updateDevice as updateDeviceDb, deleteDevice as deleteDeviceDb } from "@energyleaf/db/query";
import { deviceSchema, DeviceCategory } from "@/lib/schema/device";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserNotLoggedInError, UserNotFoundError } from "@energyleaf/lib/errors/auth";
import { getUserById } from "@energyleaf/db/query";

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
        throw new Error("Ungültige Kategorie: " + data.category);
    }

    try {
        await createDeviceDb({
            name: data.deviceName,
            userId: user.id,
            category: categoryKey,
        });
        await revalidatePath("/devices");
    } catch (error) {
        console.error("Fehler beim Erstellen des Geräts", error);
        throw new Error("Fehler beim Erstellen des Geräts: " + error.message);
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
        throw new Error("Ungültige Kategorie: " + data.category);
    }

    try {
        await updateDeviceDb(deviceId, {
            name: data.deviceName,
            category: categoryKey,
        });
        await revalidatePath("/devices");
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Geräts", error);
        throw new Error("Fehler beim Aktualisieren des Geräts: " + error.message);
    }
}

export async function deleteDevice(id: number) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    try {
        await deleteDeviceDb(id, Number(session.user.id));
        await revalidatePath("/devices");
    } catch (error) {
        console.error("Fehler beim Löschen des Geräts", error);
        throw new Error("Fehler beim Löschen des Geräts");
    }
}

