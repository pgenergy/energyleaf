"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutDemoAction } from "@/actions/auth";
import { toast } from "sonner";

import { Button } from "@energyleaf/ui";

export default function DemoBannerExit() {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function signOut() {
        startTransition(() => {
            toast.promise(signOutDemoAction, {
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
    );
}
