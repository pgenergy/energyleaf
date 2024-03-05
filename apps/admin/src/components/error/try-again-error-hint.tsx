"use client";

import {Button} from "@energyleaf/ui";
import {RotateCwIcon} from "lucide-react";

interface Props {
    resetErrorBoundary: () => void;
}

export default function TryAgainErrorHint({ resetErrorBoundary }: Props) {
    return (
        <>
            <h1 className="text-lg">Ein Fehler ist aufgetreten.</h1>
            <Button onClick={resetErrorBoundary} type="button" variant="ghost">
                <RotateCwIcon className="mr-2 h-4 w-4"/>
                Erneut versuchen
            </Button>
        </>
    )
}