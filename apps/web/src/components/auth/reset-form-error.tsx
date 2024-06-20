"use client";

import { TryAgainErrorHint } from "@energyleaf/ui/error";

export default function ResetError() {
    return (
        <div className="flex flex-col gap-2">
            <p className="font-bold text-xl">Passwort zurücksetzen</p>
            <TryAgainErrorHint />
        </div>
    );
}
