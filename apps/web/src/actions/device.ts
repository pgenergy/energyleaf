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

    try {
        await createDeviceDb({
            name: data.deviceName,
            userId: user.id,
            category: DeviceCategory[data.category],
        });
        await revalidatePath("/devices");
    } catch (error) {
        console.error("Fehler beim Erstellen des Geräts", error);
        throw new Error("Fehler beim Erstellen des Geräts");
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

    try {
        await updateDeviceDb(deviceId, {
            name: data.deviceName,
            category: DeviceCategory[data.category],
        });
        await revalidatePath("/devices");
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Geräts", error);
        throw new Error("Fehler beim Aktualisieren des Geräts");
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

