"use client";

import { signOutDemoAction } from "@/actions/auth";
import { Button } from "@energyleaf/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function DemoBanner() {
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
        <div className="fixed right-0 bottom-0 left-0 flex flex-row items-center justify-center gap-2 bg-primary px-8 py-2 text-center text-primary-foreground text-sm">
            <p>Derzeit ist der Demo Modus aktiv</p>
            <Button
                className="text-primary-foreground text-sm underline hover:text-primary-foreground hover:no-underline"
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
