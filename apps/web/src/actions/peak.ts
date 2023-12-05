"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import "server-only";
import { addPeak } from "@energyleaf/db/query";
import { peakSchema } from "@/lib/schema/peak";

export async function createPeak(data: z.infer<typeof peakSchema>, id: number | string) {
    try {
        await addPeak(Number(id), Number(data.deviceId));
        revalidatePath("/dashboard");
    } catch (e) {
        throw new Error("Error while adding peak");
    }
}