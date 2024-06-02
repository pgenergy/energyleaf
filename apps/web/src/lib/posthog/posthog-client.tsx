"use client";

import { env } from "@/env.mjs";
import posthog from "posthog-js";
import { PostHogProvider, usePostHog } from "posthog-js/react";

const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
if (typeof window !== "undefined" && posthogKey) {
    posthog.init(posthogKey, {
        api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true,
    });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
