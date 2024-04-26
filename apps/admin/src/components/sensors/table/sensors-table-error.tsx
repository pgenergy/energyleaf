"use client";

import { TryAgainErrorHint } from "@energyleaf/ui/error";
import type { FallbackProps } from "react-error-boundary";

export default function SensorsTableError({ resetErrorBoundary }: FallbackProps) {
    return <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />;
}
