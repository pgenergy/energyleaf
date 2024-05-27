"use client";

import ErrorCard from "@/components/error/error-card";
import type { FallbackProps } from "react-error-boundary";

export default function UserOnboardingCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard resetErrorBoundary={resetErrorBoundary} title="Onboarding Informationen" />;
}
