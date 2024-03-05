"use client";

import type {FallbackProps} from "react-error-boundary";
import TryAgainErrorHint from "@/components/error/try-again-error-hint";

export default function SensorsTableError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex justify-center items-center flex-col">
            <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary}/>
        </div>
    );
}