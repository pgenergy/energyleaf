"use client";

import { Button } from "@energyleaf/ui";
import { RotateCwIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";

interface Props {
    error: Error & { digist?: string };
    reset: () => void;
}

export default function ErrorPage({ reset }: Props) {
    function refresh(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        reset();
    }

    return (
        <main className="flex h-screen w-screen flex-col items-center justify-center gap-4">
            <Link className="flex flex-row items-center gap-2" href="/">
                <Image alt="logo" className="h-10 w-10" height={499} src="/image/logo/logo.png" width={499} />
                <h1 className="font-bold text-2xl">Energyleaf</h1>
            </Link>
            <h1 className="text-lg">Ein Fehler ist aufgetreten</h1>
            <Button
                onClick={() => {
                    refresh;
                }}
                type="button"
                variant="ghost"
            >
                <RotateCwIcon className="mr-2 h-4 w-4" />
                Erneut versuchen
            </Button>
        </main>
    );
}
