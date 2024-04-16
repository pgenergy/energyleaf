import Link from "next/link";
import ResetForm from "@/components/auth/reset-form";

import { CardContent, Separator } from "@energyleaf/ui";

export const metadata = {
    title: "Passwort zurücksetzen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    return (
        <CardContent>
            <ResetForm />
            <Separator />
            <div className="flex flex-col items-center gap-4 pt-4">
                <p className="text-sm text-muted-foreground">
                    <Link className="underline hover:no-underline" href="/">
                        Zurück zum Start
                    </Link>
                </p>
            </div>
        </CardContent>
    );
}
