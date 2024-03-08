"use client";

import type {FallbackProps} from "react-error-boundary";
import {TryAgainErrorHint} from "@energyleaf/ui/error";

export default function SensorsTableError({ resetErrorBoundary }: FallbackProps) {
    return (
            <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
    );
}