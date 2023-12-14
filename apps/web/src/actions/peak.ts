"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import "server-only";
import { addOrUpdatePeak as addOrUpdatePeakDb } from "@energyleaf/db/query";
import type { peakSchema } from "@/lib/schema/peak";

export async function addOrUpdatePeak(data: z.infer<typeof peakSchema>, id: number | string) {
    try {
        await addOrUpdatePeakDb(Number(id), Number(data.deviceId));
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while adding peak");
    }
}