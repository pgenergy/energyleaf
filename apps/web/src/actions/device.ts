"use server";

import { revalidatePath } from "next/cache";
import type { deviceSchema } from "@/lib/schema/device";
import type { z } from "zod";

import { getUserById } from "@energyleaf/db/query";
import { UserNotFoundError, UserNotLoggedInError } from "@energyleaf/lib/errors/auth";

import "server-only";

import { getSession } from "@/lib/auth/auth";

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
    const id = session.user.id;
    const user = await getUserById(Number(id));
    if (!user) {
        throw new UserNotFoundError();
    }

    try {
        await createDeviceDb({
            name: data.deviceName,
            userId: user.id,
        });
        revalidatePath("/devices");
    } catch (e) {
        throw new Error("Error while creating device");
    }
}

export async function updateDevice(data: z.infer<typeof deviceSchema>, id: number | string) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    const userId = session.user.id;

    const user = await getUserById(Number(userId));
    if (!user) {
        throw new UserNotFoundError();
    }

    try {
        await updateDeviceDb(Number(id), {
            name: data.deviceName,
            userId: user.id,
        });
        revalidatePath("/devices");
    } catch (e) {
        throw new Error("Error while updating device");
    }
}

export async function deleteDevice(id: number) {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    const userId = session.user.id;
    try {
        await deleteDeviceDb(id, Number(userId));
        revalidatePath("/devices");
    } catch (e) {
        throw new Error("Error while deleting device");
    }
}
