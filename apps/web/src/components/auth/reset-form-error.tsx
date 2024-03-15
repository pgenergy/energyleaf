"use client";

import type { FallbackProps } from "react-error-boundary";

import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function ResetError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Passwort zurücksetzen</p>
            <TryAgainErrorHint resetErrorBoundary={resetErrorBoundary} />
        </div>
    );
}
