"use server";

import { revalidatePath } from "next/cache";
import type { deviceSchema } from "@/lib/schema/device";
import type { z } from "zod";

import {
    createDevice as createDeviceDb,
    deleteDevice as deleteDeviceDb,
    getUserById,
    updateDevice as updateDeviceDb,
} from "@energyleaf/db/query";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";

import "server-only";

import { cookies } from "next/headers";
import { getActionSession } from "@/lib/auth/auth.action";
import { addDeviceCookieStore, isDemoUser, removeDeviceCookieStore, updateDeviceCookieStore } from "@/lib/demo/demo";
import { DeviceCategory } from "@energyleaf/db/types";

export async function createDevice(data: z.infer<typeof deviceSchema>) {
    const { user, session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        addDeviceCookieStore(cookies(), data.deviceName, data.category);
        return;
    }

    const id = user.id;
    const dbuser = await getUserById(id);
    if (!dbuser) {
        throw new UserNotFoundError();
    }

    const categoryKey = Object.keys(DeviceCategory).find(
        (key) => DeviceCategory[key as keyof typeof DeviceCategory] === data.category,
    );
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
    const { user, session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        updateDeviceCookieStore(cookies(), deviceId, data.deviceName);
        return;
    }

    const userId = user.id;
    const dbuser = await getUserById(userId);
    if (!dbuser) {
        throw new UserNotFoundError();
    }

    const categoryKey = Object.keys(DeviceCategory).find(
        (key) => DeviceCategory[key as keyof typeof DeviceCategory] === data.category,
    );
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
    const { user, session } = await getActionSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        removeDeviceCookieStore(cookies(), deviceId);
        return;
    }

    const userId = user.id;
    try {
        await deleteDeviceDb(deviceId, userId);
        revalidatePath("/devices");
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error("Fehler beim Löschen des Geräts");
        }
    }
}
