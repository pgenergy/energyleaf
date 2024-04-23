import ForgotForm from "@/components/auth/forgot-form";
import { CardContent, Separator } from "@energyleaf/ui";
import Link from "next/link";

export const metadata = {
    title: "Passwort vergessen | Energyleaf",
    robots: "noindex, nofollow",
};

export default function Page() {
    return (
        <CardContent>
            <ForgotForm />
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
