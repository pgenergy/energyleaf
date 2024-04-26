"use client";

import { signOutDemoAction } from "@/actions/auth";
import { Button } from "@energyleaf/ui";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

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
