import { getSession } from "@/lib/auth/auth.server";
import { cn } from "@energyleaf/tailwindcss/utils";
import { buttonVariants } from "@energyleaf/ui/button";
import Link from "next/link";

export default async function Footer() {
    const { user } = await getSession();

    return (
        <footer
            className={cn(
                {
                    "pb-24": !user || user.id === "demo",
                    "pb-8": user && user.id !== "demo",
                },
                "flex flex-row items-center justify-center gap-2 pt-8 text-muted-foreground",
            )}
        >
            <Link className={buttonVariants({ variant: "link" })} href="/privacy" target="_blank">
                Datenschutz
            </Link>
            <p>|</p>
            <Link href="/legal" target="_blank" className={buttonVariants({ variant: "link" })}>
                Impressum
            </Link>
        </footer>
    );
}
