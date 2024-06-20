import ResetForm from "@/components/auth/reset-form";
import { CardContent } from "@energyleaf/ui/card";
import { Separator } from "@energyleaf/ui/separator";
import Link from "next/link";

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
                <p className="text-muted-foreground text-sm">
                    <Link className="underline hover:no-underline" href="/">
                        Zurück zum Start
                    </Link>
                </p>
            </div>
        </CardContent>
    );
}
