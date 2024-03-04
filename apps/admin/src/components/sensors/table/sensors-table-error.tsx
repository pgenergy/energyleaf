"use client";

import {Button, Input} from "@energyleaf/ui";
import type {FallbackProps} from "react-error-boundary";

export default function SensorsTableError({ resetErrorBoundary }: FallbackProps) {
    return (
        <div className="flex flex-col gap-4 rounded-md border px-8 py-4">
            <p>Beim Laden der Sensoren ist ein Fehler aufgetreten.</p>
            <div className="flex flex-row justify-center">
                <Button onClick={resetErrorBoundary}>Erneut versuchen</Button>
            </div>
        </div>
    );
}