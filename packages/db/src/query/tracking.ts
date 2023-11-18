import { eq } from "drizzle-orm";

import db from "../";
import { feedback, buttonTracking } from "../schema";

export async function deleteFeedback(id: number) {
    return await db.delete(feedback).where(eq(feedback.userId, id));
}

export async function deleteButtonTracking(id: number) {
    return await db.delete(buttonTracking).where(eq(buttonTracking.id, id));
}
