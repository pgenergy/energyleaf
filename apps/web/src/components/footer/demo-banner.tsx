"use client";

import { useTransition } from "react";
import { signOutAction } from "@/actions/auth";
import { toast } from "sonner";

import { Button } from "@energyleaf/ui";
import { useRouter } from "next/navigation";

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
        <div className="fixed bottom-0 left-0 right-0 flex flex-row items-center justify-center gap-2 bg-primary px-8 py-2 text-center text-primary-foreground">
            <p>Derzeit ist der Demo Modus aktiv</p>
            <Button
                className="text-primary-foreground hover:text-primary-foreground underline"
                disabled={pending}
                onClick={() => {
                    signOut();
                }}
                variant="link"
            >
                Demo beenden
            </Button>
        </div>
    );
}
