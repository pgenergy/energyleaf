"use client";

import ErrorCard from "@/components/error/error-card";
import type { FallbackProps } from "react-error-boundary";

export function UsersOverviewCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard resetErrorBoundary={resetErrorBoundary} title="Nutzer" />;
}
