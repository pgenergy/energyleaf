"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import "server-only";

import type { peakSchema } from "@/lib/schema/peak";
import { addOrUpdatePeak as addOrUpdatePeakDb } from "@energyleaf/db/query";

export async function addOrUpdatePeak(data: z.infer<typeof peakSchema>, sensorId: number, timestamp: string) {
    try {
        await addOrUpdatePeakDb(sensorId, new Date(timestamp), Number(data.deviceId));
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while adding peak");
    }
}
