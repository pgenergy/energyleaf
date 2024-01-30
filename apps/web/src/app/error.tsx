"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { RotateCwIcon } from "lucide-react";

import { Button } from "@energyleaf/ui";

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
                <h1 className="text-2xl font-bold">Energyleaf</h1>
            </Link>
            <h1 className="text-lg">Ein Fehler ist aufgetreten</h1>
            <Button
                onClick={() => {
                    track("ErrorPage.refresh()");
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
