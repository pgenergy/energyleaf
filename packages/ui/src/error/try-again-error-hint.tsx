"use client";

import { RotateCwIcon } from "lucide-react";
import { Button } from "../ui";

interface Props {
    resetErrorBoundary: () => void;
}

export function TryAgainErrorHint({ resetErrorBoundary }: Props) {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-lg">Ein Fehler ist aufgetreten.</h1>
            <Button onClick={resetErrorBoundary} type="button" variant="ghost">
                <RotateCwIcon className="mr-2 h-4 w-4" />
                Erneut versuchen
            </Button>
        </div>
    );
}
