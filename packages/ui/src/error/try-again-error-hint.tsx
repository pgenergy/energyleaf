"use client";

import {Button} from "../ui";
import {RotateCwIcon} from "lucide-react";

interface Props {
    resetErrorBoundary: () => void;
}

export function TryAgainErrorHint({ resetErrorBoundary }: Props) {
    return (
        <div className="flex justify-center items-center flex-col">
            <h1 className="text-lg">Ein Fehler ist aufgetreten.</h1>
            <Button onClick={resetErrorBoundary} type="button" variant="ghost">
                <RotateCwIcon className="mr-2 h-4 w-4"/>
                Erneut versuchen
            </Button>
        </div>
    )
}