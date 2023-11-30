"use server";

import { deviceSchema } from "@/lib/schema/device";
import { getUserById } from "@energyleaf/db/query";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import "server-only";
import { createDevice as createDeviceDb, deleteDevice as deleteDeviceDb, updateDevice as updateDeviceDb } from "@energyleaf/db/query";

export async function createDevice(data: z.infer<typeof deviceSchema>, id: number | string) {
    const user = await getUserById(Number(id));
    if (!user) {
        throw new Error("User not found");
    }

    try {
        await createDeviceDb({
            name: data.deviceName,
            userId: user.id
        });
        revalidatePath("/devices");
    } catch (e) {
        throw new Error("Error while creating device");
    }
}

export async function updateDevice(data: z.infer<typeof deviceSchema>, id: number | string, userId: number | string) {
    const user = await getUserById(Number(userId));
    if (!user) {
        throw new Error("User not found");
    }

    try {
        await updateDeviceDb(Number(id), {
            name: data.deviceName,
            userId: user.id
        });
        revalidatePath("/devices");
    } catch (e) {
        throw new Error("Error while updating device");
    }
}

export async function deleteDevice(id: number, userId: number | string) {
    try {
        await deleteDeviceDb(id, Number(userId));
        revalidatePath("/devices");
    } catch(e) {
        throw new Error("Error while deleting device");
    }
}