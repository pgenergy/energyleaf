import Link from "next/link";
import { getSession } from "@/lib/auth/auth.server";

import DemoBannerExit from "./demo-banner-exit";

export async function DemoBanner() {
    const { user } = await getSession();

    return (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center bg-primary px-8 py-2 text-center text-primary-foreground">
            {user && user.id === "demo" ? <DemoBannerExit /> : null}
            <div className="flex flex-row items-center justify-center gap-2">
                <p>Haben Sie Interesse? Dann füllen Sie folgendes Formular aus</p>
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
