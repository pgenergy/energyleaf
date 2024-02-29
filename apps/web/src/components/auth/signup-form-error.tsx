"use client";

import type { FallbackProps } from "react-error-boundary";

import { Button } from "@energyleaf/ui";

export default function SignupError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Abenteuer beginnt hier!</p>
            <h1>Ein Fehler ist aufgetreten</h1>
            <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
        </div>
    );
}
