"use client";

import { RotateCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function TryAgainErrorHint() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-lg">Ein Fehler ist aufgetreten.</h1>
            <Button
                onClick={() => {
                    router.refresh();
                }}
                type="button"
                variant="ghost"
            >
                <RotateCwIcon className="mr-2 h-4 w-4" />
                Erneut versuchen
            </Button>
        </div>
    );
}
