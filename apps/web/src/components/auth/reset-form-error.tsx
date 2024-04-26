"use client";

import { TryAgainErrorHint } from "@energyleaf/ui/error";
import type { FallbackProps } from "react-error-boundary";

export default function ResetError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Passwort zurücksetzen</p>
            <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />
        </div>
    );
}
