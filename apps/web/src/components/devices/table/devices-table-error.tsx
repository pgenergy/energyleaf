"use client";

import { TryAgainErrorHint } from "@energyleaf/ui/error";
import { Input } from "@energyleaf/ui/input";

export default function DevicesTableError() {
    return (
        <div className="flex flex-col gap-4">
            <div className="max-w-sm">
                <Input disabled placeholder="Gerät suchen" />
            </div>
            <div className="flex flex-row justify-center rounded-md border px-8 py-4">
                <TryAgainErrorHint />
            </div>
        </div>
    );
}
