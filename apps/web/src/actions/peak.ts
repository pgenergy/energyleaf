"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import "server-only";

import { cookies } from "next/headers";
import { getActionSession } from "@/lib/auth/auth.action";
import { addOrUpdatePeakCookieStore, isDemoUser } from "@/lib/demo/demo";
import type { peakSchema } from "@/lib/schema/peak";

import { addOrUpdatePeak as addOrUpdatePeakDb } from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";

export async function addOrUpdatePeak(data: z.infer<typeof peakSchema>, sensorId: string, timestamp: string) {
    const { session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (await isDemoUser()) {
        addOrUpdatePeakCookieStore(cookies(), timestamp, data.deviceId);
        revalidatePath("/dashboard");
        return;
    }

    try {
        await addOrUpdatePeakDb(sensorId, new Date(timestamp), Number(data.deviceId));
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while adding peak");
    }
}
