"use server";

import { env } from "@/env.mjs";
import { getActionSession } from "@/lib/auth/auth.action";
import { trackAction } from "@energyleaf/db/query";
import { waitUntil } from "@vercel/functions";

interface ClientTrackingProps {
    path: string;
    search: string;
    url: string;
}

export async function clientTracking(props: ClientTrackingProps) {
    const key = env.CRON_SECRET;
    if (!key) {
        return;
    }

    const { session } = await getActionSession();
    if (!session) {
        return;
    }
    waitUntil(trackAction("page/view", "page-view", "web", { session, ...props }));
}
