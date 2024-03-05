"use client";

import type {FallbackProps} from "react-error-boundary";
import ErrorCard from "@/components/error/error-card";

export function UsersOverviewCardError({ resetErrorBoundary }: FallbackProps) {
    return <ErrorCard title="Nutzer" resetErrorBoundary={resetErrorBoundary} />;
}