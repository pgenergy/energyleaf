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

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/auth";
import { addDeviceCookieStore, isDemoUser, removeDeviceCookieStore, updateDeviceCookieStore } from "@/lib/demo/demo";

import {
    createDevice as createDeviceDb,
    deleteDevice as deleteDeviceDb,
    updateDevice as updateDeviceDb,
} from "@energyleaf/db/query";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        addDeviceCookieStore(cookies(), data.deviceName);
        return;
    }

    const id = session.user.id;
    const user = await getUserById(Number(id));
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

    if (await isDemoUser()) {
        updateDeviceCookieStore(cookies(), id, data.deviceName);
        return;
    }

    const userId = session.user.id;

    const user = await getUserById(Number(userId));
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

    if (await isDemoUser()) {
        removeDeviceCookieStore(cookies(), id);
        return;
    }

    const userId = session.user.id;
    try {
        await deleteDeviceDb(deviceId, Number(session.user.id));
        revalidatePath("/devices");
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error("Fehler beim Löschen des Geräts");
        }
    }
}

