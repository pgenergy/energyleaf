"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { peakSchema } from "@/lib/schema/peak";
import { addOrUpdatePeak as addOrUpdatePeakDb } from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

export async function addOrUpdatePeak(data: z.infer<typeof peakSchema>, sensorId: string, timestamp: string) {
    const { session } = await getActionSession();

    if (!session) {
        throw new UserNotLoggedInError();
    }

    try {
        await addOrUpdatePeakDb(sensorId, new Date(timestamp), Number(data.deviceId));
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while adding peak");
    }
}
