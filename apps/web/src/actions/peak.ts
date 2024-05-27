"use server";

import { getActionSession } from "@/lib/auth/auth.action";
import type { peakSchema } from "@/lib/schema/peak";
import { addOrUpdatePeak as addOrUpdatePeakDb } from "@energyleaf/db/query";
import { UserNotLoggedInError } from "@energyleaf/lib/errors/auth";
import { revalidatePath } from "next/cache";
import "server-only";
import type { z } from "zod";

export async function addOrUpdatePeak(data: z.infer<typeof peakSchema>, sensorId: string, timestamp: string) {
    try {
        const { session } = await getActionSession();

        if (!session) {
            throw new UserNotLoggedInError();
        }

        try {
            await addOrUpdatePeakDb(sensorId, new Date(timestamp), Number(data.deviceId));
        } catch (e) {
            return {
                success: false,
                message: "Es gab einen Fehler mit den Peaks.",
            };
        }
    } catch (err) {
        if (err instanceof UserNotLoggedInError) {
            return {
                success: false,
                message: "Sie müssen angemeldet sein um die Peaks zu bearbeiten.",
            };
        }

        return {
            success: false,
            message: "Es ist ein Fehler aufgetreten.",
        };
    }
    revalidatePath("/dashboard");
}
