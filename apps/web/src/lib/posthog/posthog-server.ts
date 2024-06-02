import { env } from "@/env.mjs";
import { PostHog } from "posthog-node";

export default function PostHogServerClient() {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!key || !host) {
        return null;
    }
    const posthogClient = new PostHog(key, {
        host: host,
        flushAt: 1,
        flushInterval: 0,
    });
    return posthogClient;
}
