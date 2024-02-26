"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { toast } from "sonner";

import { Button } from "@energyleaf/ui";

export function DemoBanner() {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function signOut() {
        startTransition(() => {
            toast.promise(signOutAction, {
                loading: "Beenden...",
                success: () => {
                    router.push("/");
                    return "Demo erfolgreich beendet.";
                },
                error: "Fehler beim Beenden der Demo.",
            });
        });
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-primary px-8 py-2 text-center text-primary-foreground">
            <div className="flex flex-row items-center justify-center gap-2 text-sm">
                <p>Derzeit ist der Demo Modus aktiv</p>
                <Button
                    className="text-sm text-primary-foreground underline hover:text-primary-foreground hover:no-underline"
                    disabled={pending}
                    onClick={() => {
                        signOut();
                    }}
                    variant="link"
                >
                    Demo beenden
                </Button>
            </div>
            <div className="flex flex-row items-center justify-center gap-2">
                <p>Haben Sie interesse? Dann füllen sie folgendes Formular aus</p>
                <Link
                    className="text-primary-foreground underline hover:no-underline"
                    href="https://forms.gle/rCLGkkNQoJQ51a7SA"
                    target="_blank"
                >
                    Zum Formular
                </Link>
            </div>
        </div>
    );
}
